import assert from 'assert';
import { getQuestions } from '../questions.ts';
import type { Journey, JourneyResponse, QuestionProps } from '../../src/index.ts';
import {
	COMPONENT_TYPES,
	buildGetJourney,
	buildGetJourneyResponseFromSession,
	saveDataToSession,
	buildList,
	buildSave,
	question,
	validate,
	validationErrorHandler,
	BOOLEAN_OPTIONS
} from '../../src/index.ts';
import { createApp } from './app.ts';
import { createJourney, JOURNEY_ID } from '../journey.ts';
import { TestServer } from './test-server.ts';
import { escapeForRegExp } from './utils.ts';
import { mockRandomUUID } from '../mock/uuid.ts';
import type { TestContext } from 'node:test';
import type { ErrorRequestHandler } from 'express';

interface CreateAppOptions {
	journeyId: string;
	createJourneyFn: (questions: object, response: JourneyResponse) => Journey;
	questions: object;
}

export async function createAppWithQuestions(ctx: TestContext, options?: CreateAppOptions): Promise<TestServer> {
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

	const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
		console.log('Internal server error for', req.method, req.url);
		console.log(error);
		if (res.headersSent) {
			return next(error);
		}
		res.status(500);
		res.send(error.stack);
	};

	app.use(errorHandler);

	const server = new TestServer(app, { rememberCookies: true, timeoutMs: 2000 });
	await server.start();
	ctx.after(async () => await server.stop());
	return server;
}

/**
 * Returns a mock value for an input field based on its properties.
 */
function mockInputFieldValue(field: { inputmode?: string; pattern?: string }): string | number {
	if (field.inputmode === 'numeric' || field.pattern === '[0-9]*') {
		return 1;
	}
	return 'test';
}

/**
 * Build a valid payload for a question.
 */
export function mockAnswerBody(q: QuestionProps) {
	switch (q.type) {
		case COMPONENT_TYPES.BOOLEAN:
			return { [q.fieldName]: BOOLEAN_OPTIONS.YES };
		case COMPONENT_TYPES.CHECKBOX: {
			const result = { [q.fieldName]: [q.options[0].value] };
			// Include conditional field if present on the first option
			if (q.options[0].conditional?.fieldName) {
				const conditionalFieldName = `${q.fieldName}_${q.options[0].conditional.fieldName}`;
				result[conditionalFieldName] = 'test conditional answer';
			}
			return result;
		}
		case COMPONENT_TYPES.RADIO: {
			const result = { [q.fieldName]: q.options[0].value };
			// Include conditional field if present on the first option
			if (q.options[0].conditional?.fieldName) {
				const conditionalFieldName = `${q.fieldName}_${q.options[0].conditional.fieldName}`;
				result[conditionalFieldName] = 'test conditional answer';
			}
			return result;
		}
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
				res[field.fieldName] = mockInputFieldValue(field);
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
 */
export function mockAnswer(q: QuestionProps) {
	switch (q.type) {
		case COMPONENT_TYPES.BOOLEAN:
			return BOOLEAN_OPTIONS.YES;
		case COMPONENT_TYPES.CHECKBOX: {
			const optionText = q.options[0].text;
			// Include conditional value if present on the first option
			if (q.options[0].conditional?.fieldName) {
				const label = q.options[0].conditional.label ? `${q.options[0].conditional.label} ` : '';
				return `${optionText}<br>${label}test conditional answer`;
			}
			return optionText;
		}
		case COMPONENT_TYPES.RADIO: {
			const optionText = q.options[0].text;
			// Include conditional value if present on the first option
			if (q.options[0].conditional?.fieldName) {
				const label = q.options[0].conditional.label ? `${q.options[0].conditional.label} ` : '';
				return `${optionText}<br>${label}test conditional answer`;
			}
			return optionText;
		}
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
					res += mockInputFieldValue(field) + '<br>';
				}
				// Remove trailing <br>
				return res.slice(0, -4);
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
 */
export async function renderQuestionCheck(
	ctx: TestContext,
	testServer: TestServer,
	url: string,
	questionText: string
): Promise<string> {
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
 */
export async function postAnswer(
	testServer: TestServer,
	url: string,
	payload: Record<string, unknown>
): Promise<string | null> {
	const response = await testServer.post(url, payload, { redirect: 'manual' });
	if (![302, 303].includes(response.status)) {
		const text = await response.text();
		console.log(`Response for ${url}:\n`, text);
	}
	assert.ok([302, 303].includes(response.status), `Expected redirect, got ${response.status}`);
	return response.headers.get('location');
}
