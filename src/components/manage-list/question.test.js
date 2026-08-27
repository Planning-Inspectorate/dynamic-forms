import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import ManageListQuestion from '#src/components/manage-list/question.js';
import { ManageListSection } from '#src/components/manage-list/manage-list-section.js';
import { mockJourney } from '#test/mock/journey.js';
import { mockRandomUUID } from '#test/mock/uuid.js';
import { configureNunjucksTestEnv } from '#test/utils/nunjucks.js';
import { assertSnapshot } from '#test/utils/utils.js';

describe('components/manage-list/question', () => {
	const TITLE = 'Things';
	const QUESTION = 'Manage list';
	const DESCRIPTION = 'A list of things';
	const FIELDNAME = 'manageListTest';
	const newQuestion = (options = {}) => {
		return new ManageListQuestion({
			title: TITLE,
			question: QUESTION,
			description: DESCRIPTION,
			fieldName: FIELDNAME,
			titleSingular: 'Thing',
			...options
		});
	};
	it('should create', () => {
		const q = newQuestion();
		assert.strictEqual(q.title, TITLE);
		assert.strictEqual(q.question, QUESTION);
		assert.strictEqual(q.description, DESCRIPTION);
		assert.strictEqual(q.fieldName, FIELDNAME);
		assert.strictEqual(q.viewFolder, 'manage-list');
		assert.strictEqual(q.isManageListQuestion, true);
	});

	it('should populate addAnotherLink & firstQuestionUrl', (ctx) => {
		const q = newQuestion();
		mockRandomUUID(ctx);
		q.section = new ManageListSection().addQuestion({ url: 'first-question' });
		const viewModel = q.prepQuestionForRendering({}, mockJourney());
		// add/<v4-guid>/<question-url>
		assert.match(viewModel?.question?.addAnotherLink, /^add\/00000000-0000-0000-0000-000000000000\/first-question/);
		assert.strictEqual(viewModel?.question?.firstQuestionUrl, 'first-question');
	});

	const questionWithManageQuestions = (ctx, options) => {
		const q = newQuestion(options);
		const innerQ1 = {
			url: 'first-question',
			title: 'Q 1',
			formatAnswerForSummary() {
				return [{ value: 'mock answer' }];
			}
		};
		const innerQ2 = {
			url: 'second-question',
			title: 'Q 2',
			formatAnswerForSummary() {
				return [{ value: 'mock answer 2' }];
			}
		};
		mockRandomUUID(ctx);
		const journey = mockJourney();
		journey.response.answers = {
			[FIELDNAME]: [{ id: 'id-1' }, { id: 'id-2' }, { id: 'id-3' }]
		};
		q.section = new ManageListSection().addQuestion(innerQ1).addQuestion(innerQ2);
		return { q, journey };
	};

	it('should format answers to questions in the section', (ctx) => {
		const { q, journey } = questionWithManageQuestions(ctx);
		const viewModel = q.prepQuestionForRendering({}, journey);
		assert.ok(Array.isArray(viewModel?.question?.valueSummary));
		assert.strictEqual(viewModel?.question?.valueSummary.length, 3);
		assert.deepStrictEqual(viewModel?.question?.valueSummary[0], {
			id: 'id-1',
			value: [
				{ question: 'Q 1', answer: 'mock answer' },
				{ question: 'Q 2', answer: 'mock answer 2' }
			]
		});
	});

	describe('formatAnswer', () => {
		it('should return the not started text when answer is not set', () => {
			const q = newQuestion();
			assert.strictEqual(q.formatAnswer(undefined), q.notStartedText);
		});

		it('should return the not started text when answer is not an array', () => {
			const q = newQuestion();
			assert.strictEqual(q.formatAnswer('not-an-array'), q.notStartedText);
		});

		it('should return the not started text when answer is an empty array', () => {
			const q = newQuestion();
			assert.strictEqual(q.formatAnswer([]), q.notStartedText);
		});

		it('should return a count of the answers by default', () => {
			const q = newQuestion();
			assert.strictEqual(q.formatAnswer([{}, {}, {}]), '3 Things');
		});

		it('should render all answers when showAnswersInSummary is true', (ctx) => {
			// nunjucks.render uses the last environment configured, so make sure one is configured
			configureNunjucksTestEnv();
			const { q } = questionWithManageQuestions(ctx, { showAnswersInSummary: true });
			const formatted = q.formatAnswer([{}, {}, {}]);
			assertSnapshot(ctx, formatted, 'manage-list-answer-summary.html');
		});
	});

	it('should integrate with formatAnswerForSummary to build a full summary row', (ctx) => {
		const q = newQuestion();
		mockRandomUUID(ctx);
		const journey = mockJourney();
		const answerForSummary = q.formatAnswerForSummary('section-1', journey, [{}, {}, {}]);
		assert.strictEqual(answerForSummary.length, 1);
		assert.deepStrictEqual(answerForSummary[0].key, TITLE);
		assert.strictEqual(answerForSummary[0].value, '3 Things');
		assert.ok(answerForSummary[0].action);
	});

	it('should render with answers', (ctx) => {
		const { q, journey } = questionWithManageQuestions(ctx);
		const viewModel = q.prepQuestionForRendering({}, journey);
		const nunjucks = configureNunjucksTestEnv();
		const res = {
			render: mock.fn((view, data) => nunjucks.render(view + '.njk', data))
		};
		q.renderAction(res, viewModel);
		assert.strictEqual(res.render.mock.callCount(), 1);
		assertSnapshot(ctx, res.render.mock.calls[0].result, 'manage-list-render.html');
	});

	it('should render with answers & questions', (ctx) => {
		const { q, journey } = questionWithManageQuestions(ctx, {
			showManageListQuestions: true
		});
		const viewModel = q.prepQuestionForRendering({}, journey);
		const nunjucks = configureNunjucksTestEnv();
		const res = {
			render: mock.fn((view, data) => nunjucks.render(view + '.njk', data))
		};
		q.renderAction(res, viewModel);
		assert.strictEqual(res.render.mock.callCount(), 1);
		assertSnapshot(ctx, res.render.mock.calls[0].result, 'manage-list-render-questions.html');
	});

	it('should render the confirmation view model', (ctx) => {
		const { q, journey } = questionWithManageQuestions(ctx, {
			showManageListQuestions: true
		});
		const itemToRemove = { id: 'id-1', name: 'Test' };
		const viewModel = q.prepQuestionForRendering({}, journey);
		const nunjucks = configureNunjucksTestEnv();
		const res = {
			render: mock.fn((view, data) => nunjucks.render(view + '.njk', data))
		};
		q.renderConfirmationAction(res, itemToRemove, viewModel);
		assert.strictEqual(res.render.mock.callCount(), 1);
		assertSnapshot(ctx, res.render.mock.calls[0].result, 'manage-list-confirmation-render.html');
	});

	describe('getDataToSave', () => {
		it('should return existing journey answers if present', async () => {
			const q = newQuestion();
			const existingData = [{ id: '1', name: 'Test' }];
			const req = { body: {} };
			const journeyResponse = {
				answers: {
					[FIELDNAME]: existingData
				}
			};

			const result = await q.getDataToSave(req, journeyResponse);

			assert.deepStrictEqual(result, {
				answers: {
					[FIELDNAME]: existingData
				}
			});
		});

		it('should return an empty array if no journey answers are present', async () => {
			const q = newQuestion();
			const req = { body: {} };
			const journeyResponse = {
				answers: {}
			};

			const result = await q.getDataToSave(req, journeyResponse);

			assert.deepStrictEqual(result, {
				answers: {
					[FIELDNAME]: []
				}
			});
		});
	});
});
