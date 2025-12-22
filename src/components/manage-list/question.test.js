import { describe, it } from 'node:test';
import assert from 'node:assert';
import ManageListQuestion from '#src/components/manage-list/question.js';
import { ManageListSection } from '#src/components/manage-list/manage-list-section.js';
import { mockJourney } from '#test/mock/journey.js';
import { mockRandomUUID } from '#src/lib/uuid.test.js';

describe('components/manage-list/question', () => {
	const TITLE = 'Things';
	const QUESTION = 'Manage list';
	const DESCRIPTION = 'A list of things';
	const FIELDNAME = 'manageListTest';
	const newQuestion = () => {
		return new ManageListQuestion({
			title: TITLE,
			question: QUESTION,
			description: DESCRIPTION,
			fieldName: FIELDNAME
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

	it('should populate addAnotherLink', (ctx) => {
		const q = newQuestion();
		mockRandomUUID(ctx);
		q.section = new ManageListSection().addQuestion({ url: 'first-question' });
		const viewModel = q.prepQuestionForRendering({}, mockJourney());
		// add/<v4-guid>/<question-url>
		assert.match(viewModel?.question?.addAnotherLink, /^add\/00000000-0000-0000-0000-000000000000\/first-question/);
	});

	it('should format list answer for summary', (ctx) => {
		const q = newQuestion();
		mockRandomUUID(ctx);
		const answerForSummary = q.formatAnswerForSummary('section-1', mockJourney(), [{}, {}, {}]);
		assert.strictEqual(answerForSummary.length, 1);
		assert.strictEqual(answerForSummary[0].value, '3 Things');
	});
});
