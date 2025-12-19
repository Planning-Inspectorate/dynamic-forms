import { createApp } from '#test/utils/app.js';
import { buildSave, question } from '#src/controller.js';
import { getQuestions } from './questions.js';
import { buildGetJourney } from '#src/middleware/build-get-journey.js';
import { createJourney, JOURNEY_ID } from './journey.js';
import { buildGetJourneyResponseFromSession, saveDataToSession } from '#src/lib/session-answer-store.js';
import http from 'http';
import { createRequire } from 'node:module';
import path from 'node:path';
import express from 'express';
import validate from '#src/validator/validator.js';
import { validationErrorHandler } from '#src/validator/validation-error-handler.js';

const app = createApp();
const questions = getQuestions();
const getJourney = buildGetJourney((req, journeyResponse) => createJourney(questions, journeyResponse, req));
const getJourneyResponse = buildGetJourneyResponseFromSession(JOURNEY_ID);

const require = createRequire(import.meta.url);
// resolves to <root>/node_modules/govuk-frontend/dist/govuk/all.bundle.js than maps to `dist`
const govUkRoot = path.resolve(require.resolve('govuk-frontend'), '..');

app.use(express.static(govUkRoot));
app.use((req, res, next) => {
	saveDataToSession({
		req,
		journeyId: JOURNEY_ID,
		data: {
			answers: {
				manageListTest: [{ name: 'List item 1' }, { name: 'List item 2' }]
			}
		}
	});
	next();
});

const router = express.Router();
router.get('/:section/:question', getJourneyResponse, getJourney, question);
router.post(
	'/:section/:question',
	getJourneyResponse,
	getJourney,
	validate,
	validationErrorHandler,
	buildSave(saveDataToSession)
);
app.use('/journey', router);

const server = http.createServer(app);
const port = 8080;

server.listen(port, () => {
	console.log('listening on', port);
	console.log(`http://localhost:${port}`);
});
