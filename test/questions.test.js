import { describe, it } from 'node:test';
import assert from 'assert';
import { createApp } from './utils/app.js';
import { TestServer } from './utils/test-server.js';
import { getQuestions, questionsInOrder } from './questions.js';
import { buildGetJourney } from '../src/middleware/build-get-journey.js';
import { createJourney, JOURNEY_ID } from './journey.js';
import { buildGetJourneyResponseFromSession, saveDataToSession } from '../src/lib/session-answer-store.js';
import validate from '../src/validator/validator.js';
import { validationErrorHandler } from '../src/validator/validation-error-handler.js';
import { buildSave, list, question } from '../src/controller.js';
import path from 'path';
import { COMPONENT_TYPES } from '../src/index.js';
import { escapeForRegExp, snapshotsDir } from './utils/utils.js';
import { BOOLEAN_OPTIONS } from '../src/components/boolean/question.js';

/**
 * @param {import('node:test').TestContext} ctx
 * @returns {Promise<TestServer>}
 */
export async function createAppWithQuestions(ctx) {
	const app = createApp();
	const questions = getQuestions();
	const getJourney = buildGetJourney((req, journeyResponse) => createJourney(questions, journeyResponse));
	const getJourneyResponse = buildGetJourneyResponseFromSession(JOURNEY_ID);

	// app.use((req, res, next) => {
	//   console.log(req.method, req.url, req.session);
	//   next();
	// });

	app.get('/:section/:question', getJourneyResponse, getJourney, question);

	app.post(
		'/:section/:question',
		getJourneyResponse,
		getJourney,
		validate,
		validationErrorHandler,
		buildSave(saveDataToSession)
	);

	app.get('/check-your-answers', getJourneyResponse, getJourney, (req, res) => list(req, res, '', {}));

	app.use((req, res) => {
		res.status(404);
	});

	/**
	 * @type {import('express').ErrorRequestHandler}
	 */
	function errorHandler(error, req, res, next) {
		if (error) {
			console.error('Internal Server Error:', error);
			if (res.headersSent) {
				return next(error);
			}
			res.status(500);
			res.render('error', { error });
		} else {
			next();
		}
	}

	app.use(errorHandler);

	const server = new TestServer(app, { rememberCookies: true, timeoutMs: 2000 });
	await server.start();
	ctx.after(async () => await server.stop());
	return server;
}

describe('question pages', () => {
	it('should have a test for each question type', () => {
		const questionsByType = new Map();
		for (const q of questionsInOrder) {
			if (!questionsByType.has(q.type)) {
				questionsByType.set(q.type, []);
			}
			questionsByType.get(q.type).push(q);
		}
		for (const [k, v] of Object.entries(COMPONENT_TYPES)) {
			const questions = questionsByType.get(v);
			if (!questions || questions.length === 0) {
				throw new Error(`no test questions for ${k}`);
			}
		}
	});

	for (let i = 0; i < questionsInOrder.length; i++) {
		const q = questionsInOrder[i];

		it(`should render question: ${q.url}`, async (ctx) => {
			const testServer = await createAppWithQuestions(ctx);

			const response = await testServer.get('/questions/' + q.url, {
				redirect: 'manual'
			});
			assert.strictEqual(response.status, 200);
			const text = await response.text();
			// be sure to escape parentheses in the question text for the regex
			assert.match(text, new RegExp(escapeForRegExp(q.question), 'i'));
			assert.match(text, /<form action="" method="post"/i);
			if (q.options) {
				for (const option of q.options) {
					if (q.type === COMPONENT_TYPES.SELECT) {
						assert.match(
							text,
							new RegExp(`<option[^>]*value="${option.value}"[^>]*>\\s*${option.text}\\s*</option>`, 'i')
						);
					} else {
						assert.match(text, new RegExp(`<input[^>]*value="${option.value}"[^>]*>`));
						assert.match(text, new RegExp(`<label[^>]*>\\s*${option.text}\\s*</label>`, 'i'));
					}
				}
			}
			ctx.assert.fileSnapshot(text, path.join(snapshotsDir(), q.url + '.html'), {
				serializers: [(v) => v]
			});
		});

		it(`should POST valid data for question: ${q.url} and redirect to next`, async (ctx) => {
			const testServer = await createAppWithQuestions(ctx);
			const payload = mockAnswerBody(q);
			const response = await testServer.post(`/questions/${q.url}`, payload, { redirect: 'manual' });
			if (![302, 303].includes(response.status)) {
				const text = await response.text();
				console.log(`Response for ${q.url}:\n`, text);
			}
			// Should redirect (302 or 303)
			assert.ok([302, 303].includes(response.status), `Expected redirect, got ${response.status}`);
			// Should redirect to the next question (if there is one)
			const location = response.headers.get('location');
			const nextQ = questionsInOrder[i + 1];
			if (nextQ) {
				assert.strictEqual(location, `questions/${nextQ.url}`);
			} else {
				assert.strictEqual(location, 'check-your-answers');
			}
		});
	}
});

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
		default:
			return 'test';
	}
}
