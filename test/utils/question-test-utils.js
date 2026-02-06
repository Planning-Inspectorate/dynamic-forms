import assert from 'assert';
import { getQuestions } from '#test/questions.js';
import { COMPONENT_TYPES } from '#src/index.js';
import { createApp } from '#test/utils/app.js';
import { buildGetJourney } from '#src/middleware/build-get-journey.js';
import { buildGetJourneyResponseFromSession, saveDataToSession } from '#src/lib/session-answer-store.js';
import { createJourney, JOURNEY_ID } from '#test/journey.js';
import { buildList, buildSave, question } from '#src/controller.js';
import validate from '#src/validator/validator.js';
import { validationErrorHandler } from '#src/validator/validation-error-handler.js';
import { TestServer } from '#test/utils/test-server.js';
import { BOOLEAN_OPTIONS } from '#src/components/boolean/question.js';
import { escapeForRegExp } from '#test/utils/utils.js';
import { mockRandomUUID } from '#test/mock/uuid.js';

/**
 * @typedef {Object} CreateAppOptions
 * @property {string} journeyId - The journey ID for session storage
 * @property {(questions: Object, response: import('#src/journey/journey-response.js').JourneyResponse) => import('#src/journey/journey.js').Journey} createJourneyFn - Function to create the journey
 * @property {Object} questions - The questions object
 */

/**
 * @param {import('node:test').TestContext} ctx
 * @param {CreateAppOptions} [options]
 * @returns {Promise<TestServer>}
 */
export async function createAppWithQuestions(ctx, options) {
	const app = createApp();
	const questions = options?.questions ?? getQuestions();
	const journeyId = options?.journeyId ?? JOURNEY_ID;
	const createJourneyFn = options?.createJourneyFn ?? createJourney;
	const getJourney = buildGetJourney((req, journeyResponse) => createJourneyFn(questions, journeyResponse));
	const getJourneyResponse = buildGetJourneyResponseFromSession(journeyId);

	// app.use((req, res, next) => {
	//   console.log(req.method, req.url, req.session);
	//   next();
	// });

	app.get(
		'/:section/:question{/:manageListAction/:manageListItemId/:manageListQuestion}',
		getJourneyResponse,
		getJourney,
		question
	);

	app.post(
		'/:section/:question{/:manageListAction/:manageListItemId/:manageListQuestion}',
		getJourneyResponse,
		getJourney,
		validate,
		validationErrorHandler,
		buildSave(saveDataToSession)
	);

	app.get('/check-your-answers', getJourneyResponse, getJourney, buildList());

	app.use((req, res) => {
		res.status(404);
	});

	/**
	 * @type {import('express').ErrorRequestHandler}
	 */
	function errorHandler(error, req, res, next) {
		console.error('Internal Server Error:', error);
		if (res.headersSent) {
			return next(error);
		}
		res.status(500);
		res.render('error', { error });
	}

	app.use(errorHandler);

	const server = new TestServer(app, { rememberCookies: true, timeoutMs: 2000 });
	await server.start();
	ctx.after(async () => await server.stop());
	return server;
}

/**
 * Build a valid payload for a question.
 * @param {import('../src/questions/question-props.js').QuestionProps} q
 * @returns {Object}
 */
export function mockAnswerBody(q) {
	switch (q.type) {
		case COMPONENT_TYPES.BOOLEAN:
			return { [q.fieldName]: BOOLEAN_OPTIONS.YES };
		case COMPONENT_TYPES.CHECKBOX:
			return { [q.fieldName]: [q.options[0].value] };
		case COMPONENT_TYPES.RADIO:
		case COMPONENT_TYPES.SELECT:
			return { [q.fieldName]: q.options[0].value };
		case COMPONENT_TYPES.NUMBER:
			return { [q.fieldName]: 1 };
		case COMPONENT_TYPES.DATE:
			return {
				[q.fieldName + '_day']: 1,
				[q.fieldName + '_month']: 1,
				[q.fieldName + '_year']: 2025
			};
		case COMPONENT_TYPES.DATE_PERIOD:
			return {
				[q.fieldName + '_start_day']: 1,
				[q.fieldName + '_start_month']: 1,
				[q.fieldName + '_start_year']: 2025,
				[q.fieldName + '_end_day']: 2,
				[q.fieldName + '_end_month']: 1,
				[q.fieldName + '_end_year']: 2025
			};
		case COMPONENT_TYPES.DATE_TIME:
			return {
				[q.fieldName + '_day']: 1,
				[q.fieldName + '_month']: 1,
				[q.fieldName + '_year']: 2025,
				[q.fieldName + '_hour']: 10,
				[q.fieldName + '_minutes']: 45,
				[q.fieldName + '_period']: 'am'
			};
		case COMPONENT_TYPES.TEXT_ENTRY:
		case COMPONENT_TYPES.SINGLE_LINE_INPUT:
			return { [q.fieldName]: 'test' };
		case COMPONENT_TYPES.TEXT_ENTRY_REDACT:
			return { [q.fieldName]: 'secret' };
		case COMPONENT_TYPES.MULTI_FIELD_INPUT: {
			const res = {};
			for (const field of q.inputFields) {
				res[field.fieldName] = mockAnswer(field);
			}
			return res;
		}
		case COMPONENT_TYPES.ADDRESS:
			return {
				[q.fieldName + '_addressLine1']: '1 Test St',
				[q.fieldName + '_townCity']: 'Testville',
				[q.fieldName + '_postcode']: 'TE5 5ST'
			};
		case COMPONENT_TYPES.UNIT_OPTION:
			return {
				[q.fieldName]: 'kg',
				[q.options[0].conditional.fieldName]: 10
			};
		case COMPONENT_TYPES.EMAIL:
			return { [q.fieldName]: 'test@example.com' };
		case COMPONENT_TYPES.MANAGE_LIST: {
			// manage list questions not available here so just hard coded
			return {
				[q.fieldName]: [
					{ id: '1234', travelCompanionName: 'Companion 1', travelCompanionEmail: 'companion-1@example.com' },
					{ id: '4567', travelCompanionName: 'Companion 2', travelCompanionEmail: 'companion-2@example.com' },
					{ id: '8901', travelCompanionName: 'Companion 3', travelCompanionEmail: 'companion-3@example.com' }
				]
			};
		}
		default:
			return { [q.fieldName]: 'test' };
	}
}

/**
 * Build a valid & formatted answer for a question.
 * @param {import('../src/questions/question-props.js').QuestionProps} q
 * @returns {Object}
 */
export function mockAnswer(q) {
	switch (q.type) {
		case COMPONENT_TYPES.BOOLEAN:
			return BOOLEAN_OPTIONS.YES;
		case COMPONENT_TYPES.CHECKBOX:
			return q.options[0].text;
		case COMPONENT_TYPES.RADIO:
		case COMPONENT_TYPES.SELECT:
			return q.options[0].text;
		case COMPONENT_TYPES.NUMBER:
			return 1;
		case COMPONENT_TYPES.DATE:
			return '1 January 2025';
		case COMPONENT_TYPES.DATE_PERIOD:
			return 'Start: 00:00 1 January 2025<br>End: 00:00 2 January 2025';
		case COMPONENT_TYPES.DATE_TIME:
			return '1 January 2025<br>10:45am';
		case COMPONENT_TYPES.TEXT_ENTRY:
		case COMPONENT_TYPES.SINGLE_LINE_INPUT:
			return 'test';
		case COMPONENT_TYPES.TEXT_ENTRY_REDACT:
			return 'secret';
		case COMPONENT_TYPES.MULTI_FIELD_INPUT:
			if (q.inputFields) {
				let res = '';
				for (const field of q.inputFields) {
					res += mockAnswer(field) + '<br>';
				}
				return res;
			}
			break;
		case COMPONENT_TYPES.ADDRESS: {
			const answer = mockAnswerBody(q);
			return Object.values(answer).filter(Boolean).join('<br>');
		}
		case COMPONENT_TYPES.UNIT_OPTION:
			return '10 kg';
		case COMPONENT_TYPES.EMAIL:
			return 'test@example.com';
		case COMPONENT_TYPES.MANAGE_LIST: {
			return `3 ${q.title}`;
		}
		default:
			return 'test';
	}
}

/**
 * Helper to render a question and check it's displayed correctly
 * @param {import('node:test').TestContext} ctx
 * @param {import('./test-server.js').TestServer} testServer
 * @param {string} url
 * @param {string} questionText
 * @returns {Promise<string>}
 */
export async function renderQuestionCheck(ctx, testServer, url, questionText) {
	mockRandomUUID(ctx);
	const response = await testServer.get(url, { redirect: 'manual' });
	assert.strictEqual(response.status, 200, `Expected 200 for ${url}, got ${response.status}`);
	const text = await response.text();
	assert.match(text, new RegExp(escapeForRegExp(questionText), 'i'));
	assert.match(text, /<form action="" method="post"/i);
	return text;
}

/**
 * Helper to POST an answer and check the redirect
 * @param {import('./test-server.js').TestServer} testServer
 * @param {string} url
 * @param {Record<string, unknown>} payload
 * @returns {Promise<string|null>}
 */
export async function postAnswer(testServer, url, payload) {
	const response = await testServer.post(url, payload, { redirect: 'manual' });
	if (![302, 303].includes(response.status)) {
		const text = await response.text();
		console.log(`Response for ${url}:\n`, text);
	}
	assert.ok([302, 303].includes(response.status), `Expected redirect, got ${response.status}`);
	return response.headers.get('location');
}
