import { describe, it } from 'node:test';
import assert from 'assert';
import { manageListQuestions, questionsInOrder } from './questions.js';
import path from 'path';
import { escapeForRegExp, snapshotsDir } from './utils/utils.js';
import { createAppWithQuestions, mockAnswer, mockAnswerBody } from './utils/question-test-utils.js';
import { COMPONENT_TYPES } from '#src/index.js';

describe('check-your-answers', () => {
	it(`should render all question rows with no answers`, async (ctx) => {
		const testServer = await createAppWithQuestions(ctx);

		const response = await testServer.get('/check-your-answers');
		assert.strictEqual(response.status, 200);
		const text = await response.text();
		const rows = text.split('<div class="govuk-summary-list__row">').slice(1); // Skip the first split part which is before the first row

		assert.strictEqual(rows.length, questionsInOrder.length, 'Expected one row per question');

		for (let i = 0; i < questionsInOrder.length; i++) {
			const q = questionsInOrder[i];
			const row = rows[i];

			const escapedTitle = escapeForRegExp(q.title);
			const escapedQ = escapeForRegExp(q.question);
			assert.match(row, new RegExp(`<dt[^>]*>\\s*${escapedTitle}\\s*</dt>`, 'i'));
			assert.match(row, new RegExp(`<dd[^>]*>\\s*Not started\\s*</dd>`, 'i'));
			assert.match(
				row,
				new RegExp(`<a[^>]* href="questions/${q.url}">\\s*Answer\\s*<span[^>]*>\\s*${escapedQ}\\s*</span></a>`, 'i')
			);
		}
		ctx.assert.fileSnapshot(text, path.join(snapshotsDir(), 'check-your-answers-not-started.html'), {
			serializers: [(v) => v]
		});
	});

	it(`should render all question answers`, async (ctx) => {
		const testServer = await createAppWithQuestions(ctx);

		// 'answer' each question
		for (const q of questionsInOrder) {
			// Save happens on subquestion for manage list questions
			if (q.type === COMPONENT_TYPES.MANAGE_LIST) {
				// Get the list of subquestions for this manage list question
				const manageListQuestion = manageListQuestions.find(
					(question) => question.manageListQuestion.fieldName === q.fieldName
				);
				const subQuestionAnswers = mockAnswerBody(q)[manageListQuestion.manageListQuestion.fieldName];
				// Post to them individually
				for (const answer of subQuestionAnswers) {
					const id = answer.id;
					for (const subQuestion of manageListQuestion.questions) {
						const key = subQuestion.fieldName;
						const body = { [key]: answer[key] };
						await testServer.post(`/questions/${q.url}/add/${id}/${subQuestion.url}`, body, { redirect: 'manual' });
					}
				}
			}
			await testServer.post(`/questions/${q.url}`, mockAnswerBody(q), { redirect: 'manual' });
		}

		const response = await testServer.get('/check-your-answers');
		assert.strictEqual(response.status, 200);
		const text = await response.text();
		const rows = text.split('<div class="govuk-summary-list__row">').slice(1); // Skip the first split part which is before the first row

		assert.strictEqual(rows.length, questionsInOrder.length, 'Expected one row per question');

		for (let i = 0; i < questionsInOrder.length; i++) {
			const q = questionsInOrder[i];
			const row = rows[i];

			const escapedTitle = escapeForRegExp(q.title);
			const escapedQ = escapeForRegExp(q.question);
			assert.match(row, new RegExp(`<dt[^>]*>\\s*${escapedTitle}\\s*</dt>`, 'i'));
			assert.match(row, new RegExp(`<dd[^>]*>\\s*${mockAnswer(q)}\\s*</dd>`, 'i'));
			assert.match(
				row,
				new RegExp(`<a[^>]* href="questions/${q.url}">\\s*Change\\s*<span[^>]*>\\s*${escapedQ}\\s*</span></a>`, 'i')
			);
		}
		ctx.assert.fileSnapshot(text, path.join(snapshotsDir(), 'check-your-answers-with-answers.html'), {
			serializers: [(v) => v]
		});
	});
});
