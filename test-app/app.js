import { createApp } from '#test/utils/app.js';
import { getQuestions } from './questions.js';
import { buildGetJourney } from '#src/middleware/build-get-journey.js';
import { createJourney, JOURNEY_ID } from './journey.js';
import { buildGetJourneyResponseFromSession, saveDataToSession } from '#src/lib/session-answer-store.js';
import { createRequire } from 'node:module';
import path from 'node:path';
import express from 'express';
import { buildList, buildSave, question } from '#src/controller.js';
import validate from '#src/validator/validator.js';
import { validationErrorHandler } from '#src/validator/validation-error-handler.js';
import { configureNunjucksTestEnv } from '#test/utils/nunjucks.js';
import { redirectToUnansweredQuestion } from '#src/middleware/redirect-to-unanswered-question.js';

/**
 * @returns {import('express').Express}
 */
export function buildTestApp() {
	const app = createApp();
	const questions = getQuestions();
	const getJourney = buildGetJourney((req, journeyResponse) => createJourney(questions, journeyResponse, req));
	const getJourneyResponse = buildGetJourneyResponseFromSession(JOURNEY_ID);

	const nunjucksEnvironment = configureNunjucksTestEnv();
	nunjucksEnvironment.express(app);
	app.set('view engine', 'njk');

	const require = createRequire(import.meta.url);
	// resolves to <root>/node_modules/govuk-frontend/dist/govuk/all.bundle.js than maps to `dist`
	const govUkRoot = path.resolve(require.resolve('govuk-frontend'), '..');

	app.use(express.static(govUkRoot));

	app.use((req, res, next) => {
		// log requests for info
		console.debug(req.method.padEnd(5, ' '), req.url);
		if (req.session.forms) {
			next();
			return;
		}
		saveDataToSession({
			req,
			journeyId: JOURNEY_ID,
			data: {
				answers: {
					manageListTest: [
						{
							id: '00000000-0000-0000-0000-000000000001',
							travelInsuranceType: 'basic',
							departureDate: '2025-12-25T12:00:00Z'
						},
						{
							id: '00000000-0000-0000-0000-000000000002',
							travelInsuranceType: 'comprehensive',
							activityLocation: {
								addressLine1: '<strong>Some</strong> Project Place<br>',
								addressLine2: 'Some Street',
								townCity: 'Some City',
								county: 'Some County',
								postcode: 'BS1 6EB'
							},
							departureDate: '2025-01-25T12:00:00Z'
						},
						{
							id: '00000000-0000-0000-0000-000000000003',
							travelInsuranceType: 'premium',
							departureDate: '2025-06-25T12:00:00Z'
						}
					]
				}
			}
		});
		next();
	});

	const router = express.Router();
	router.get('/', getJourneyResponse, getJourney, redirectToUnansweredQuestion());
	router.get(
		'/:section/:question{/:manageListAction/:manageListItemId/:manageListQuestion}',
		getJourneyResponse,
		getJourney,
		question
	);

	router.post(
		'/:section/:question{/:manageListAction/:manageListItemId/:manageListQuestion}',
		getJourneyResponse,
		getJourney,
		validate,
		validationErrorHandler,
		buildSave(saveDataToSession, true)
	);
	router.get('/check-your-answers', getJourneyResponse, getJourney, buildList());

	app.get('/', (req, res) => res.redirect('/journey'));
	app.use('/journey', router);
	return app;
}
