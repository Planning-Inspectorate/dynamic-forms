import { describe, it } from 'node:test';
import assert from 'assert';
import { COMPONENT_TYPES, Journey, Section } from '../src/index.js';
import { createAppWithQuestions } from '#test/utils/question-test-utils.js';
import { createQuestions } from '../src/questions/create-questions.js';
import { questionClasses } from '../src/questions/questions.js';
import { questionProps, questionsInOrder } from '#test/questions.js';
import { assertSnapshot } from '#test/utils/utils.js';
import { mockRandomUUID } from '#test/mock/uuid.js';
import { createJourney as createTestJourney, JOURNEY_ID } from '#test/journey.js';

/**
 * @type {import('../src/questions/question-types.d.ts').SecondaryAction[]}
 */
const testSecondaryActions = [
	{
		text: 'Save and return',
		href: '/return',
		classes: 'govuk-button--secondary'
	},
	{
		text: 'Cancel',
		type: 'submit',
		formaction: '/cancel',
		classes: 'govuk-button--secondary'
	}
];

/**
 * Build question props with secondaryActions appended, from questionsInOrder.
 */
const questionPropsWithSecondaryActions = Object.fromEntries(
	Object.entries(questionProps).map(([k, v]) => [
		k,
		{
			...v,
			viewData: {
				...v.viewData,
				secondaryActions: testSecondaryActions
			}
		}
	])
);

/**
 * Question definitions that use the deprecated extraActionButtons
 */
const questionPropsWithExtraActionButtons = {
	testRadioLegacy: {
		type: COMPONENT_TYPES.RADIO,
		title: 'Test Radio Legacy',
		question: 'Pick an option (legacy)',
		fieldName: 'testRadioLegacy',
		url: 'test-radio-legacy',
		options: [
			{ value: 'a', text: 'Option A' },
			{ value: 'b', text: 'Option B' }
		],
		viewData: {
			extraActionButtons: testSecondaryActions
		}
	}
};

function createBasicJourney(questions, response) {
	const section = new Section('Test', 'questions');
	for (const q of Object.values(questions)) {
		section.addQuestion(q);
	}
	return new Journey({
		journeyId: JOURNEY_ID,
		sections: [section],
		taskListUrl: 'check-your-answers',
		journeyTemplate: 'views/layout-journey.njk',
		taskListTemplate: 'views/layout-check-your-answers.njk',
		journeyTitle: 'Secondary Actions Test',
		returnToListing: false,
		makeBaseUrl: () => '/',
		initialBackLink: '/',
		response
	});
}

function getQuestions(props) {
	return createQuestions(props, questionClasses, {});
}

describe('secondary actions', () => {
	describe('renders secondaryActions buttons', () => {
		const questionTypes = Object.entries(questionPropsWithSecondaryActions)
			// filter out manage list sub-questions
			.filter(([, v]) => questionsInOrder.some((q) => q.fieldName === v.fieldName));

		for (const [, props] of questionTypes) {
			it(`should render secondary action buttons for ${props.type} component`, async (ctx) => {
				const questions = getQuestions(questionPropsWithSecondaryActions);
				const testServer = await createAppWithQuestions(ctx, {
					journeyId: JOURNEY_ID,
					questions,
					createJourneyFn: (q, response) => createTestJourney(q, response)
				});

				const response = await testServer.get(`/questions/${props.url}`, { redirect: 'manual' });
				assert.strictEqual(response.status, 200);
				const text = await response.text();

				// should render the primary submit button
				assert.match(text, /button-save-and-continue/);

				// should wrap buttons in a button group
				assert.match(text, /govuk-button-group/);

				// should render the secondary action buttons
				assert.match(text, /Save and return/);
				assert.match(text, /button-save-and-return/);
				assert.match(text, /Cancel/);
				assert.match(text, /button-cancel/);

				// should have secondary button classes
				assert.match(text, /govuk-button--secondary/);
			});
		}
	});

	describe('backwards compatibility with extraActionButtons', () => {
		it('should render buttons when extraActionButtons is used', async (ctx) => {
			const questions = getQuestions(questionPropsWithExtraActionButtons);
			const testServer = await createAppWithQuestions(ctx, {
				journeyId: JOURNEY_ID,
				questions,
				createJourneyFn: (q, response) => createBasicJourney(q, response)
			});

			const response = await testServer.get('/questions/test-radio-legacy', { redirect: 'manual' });
			assert.strictEqual(response.status, 200);
			const text = await response.text();

			// should still render the secondary action buttons via backwards compat
			assert.match(text, /Save and return/);
			assert.match(text, /button-save-and-return/);
			assert.match(text, /Cancel/);
			assert.match(text, /button-cancel/);
			assert.match(text, /govuk-button--secondary/);
		});
	});

	describe('renders without secondaryActions', () => {
		it('should render only the submit button when no secondaryActions', async (ctx) => {
			// Use the first radio question without secondary actions
			const radioQuestion = questionsInOrder.find((q) => q.type === COMPONENT_TYPES.RADIO);
			const questionPropsNoActions = {
				[radioQuestion.fieldName]: { ...radioQuestion }
			};

			const questions = getQuestions(questionPropsNoActions);
			const testServer = await createAppWithQuestions(ctx, {
				journeyId: JOURNEY_ID,
				questions,
				createJourneyFn: (q, response) => createBasicJourney(q, response)
			});

			const response = await testServer.get(`/questions/${radioQuestion.url}`, { redirect: 'manual' });
			assert.strictEqual(response.status, 200);
			const text = await response.text();

			// should render the primary submit button
			assert.match(text, /button-save-and-continue/);

			// should NOT wrap in a button group
			assert.doesNotMatch(text, /govuk-button-group/);

			// should NOT render secondary action buttons
			assert.doesNotMatch(text, /button-save-and-return/);
			assert.doesNotMatch(text, /button-cancel/);
		});
	});

	describe('secondary action button attributes', () => {
		const firstQuestionProps = Object.values(questionPropsWithSecondaryActions)[0];

		it('should render formaction attribute', async (ctx) => {
			const questions = getQuestions(questionPropsWithSecondaryActions);
			const testServer = await createAppWithQuestions(ctx, {
				journeyId: JOURNEY_ID,
				questions,
				createJourneyFn: (q, response) => createTestJourney(q, response)
			});

			const response = await testServer.get(`/questions/${firstQuestionProps.url}`, { redirect: 'manual' });
			assert.strictEqual(response.status, 200);
			const text = await response.text();

			// Cancel button should have formaction="/cancel"
			assert.match(text, /formaction="\/cancel"/);
		});

		it('should render href attribute for link actions', async (ctx) => {
			const questions = getQuestions(questionPropsWithSecondaryActions);
			const testServer = await createAppWithQuestions(ctx, {
				journeyId: JOURNEY_ID,
				questions,
				createJourneyFn: (q, response) => createTestJourney(q, response)
			});

			const response = await testServer.get(`/questions/${firstQuestionProps.url}`, { redirect: 'manual' });
			assert.strictEqual(response.status, 200);
			const text = await response.text();

			// "Save and return" link action should have href="/return"
			assert.match(text, /href="\/return"/);
		});
	});

	describe('snapshots', () => {
		const radioQuestion = questionsInOrder.find((q) => q.type === COMPONENT_TYPES.RADIO);

		it('should match snapshot with secondary actions', async (ctx) => {
			const questions = getQuestions(questionPropsWithSecondaryActions);
			const testServer = await createAppWithQuestions(ctx, {
				journeyId: JOURNEY_ID,
				questions,
				createJourneyFn: (q, response) => createTestJourney(q, response)
			});

			mockRandomUUID(ctx);
			const response = await testServer.get(`/questions/${radioQuestion.url}`, { redirect: 'manual' });
			assert.strictEqual(response.status, 200);
			const text = await response.text();

			assertSnapshot(ctx, text, 'secondary-actions-radio.html');
		});

		it('should match snapshot without secondary actions', async (ctx) => {
			const questionPropsNoActions = {
				[radioQuestion.fieldName]: { ...radioQuestion }
			};

			const questions = getQuestions(questionPropsNoActions);
			const testServer = await createAppWithQuestions(ctx, {
				journeyId: JOURNEY_ID,
				questions,
				createJourneyFn: (q, response) => createBasicJourney(q, response)
			});

			mockRandomUUID(ctx);
			const response = await testServer.get(`/questions/${radioQuestion.url}`, { redirect: 'manual' });
			assert.strictEqual(response.status, 200);
			const text = await response.text();

			assertSnapshot(ctx, text, 'secondary-actions-radio-plain.html');
		});
	});
});
