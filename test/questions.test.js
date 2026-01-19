import { describe, it } from 'node:test';
import assert from 'assert';
import { manageListQuestions, questionsInOrder } from './questions.js';
import path from 'path';
import { COMPONENT_TYPES } from '../src/index.js';
import { escapeForRegExp, snapshotsDir } from './utils/utils.js';
import { createAppWithQuestions, mockAnswerBody } from '#test/utils/question-test-utils.js';
import { mockRandomUUID } from '#test/mock/uuid.js';

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

	/**
	 * @param {import('node:test').TestContext} ctx
	 * @param {string} url
	 * @param {string} snapshotName
	 * @param {import('#src/questions/question.js')} q
	 * @returns {Promise<void>}
	 */
	async function renderQuestionCheck(ctx, url, snapshotName, q) {
		mockRandomUUID(ctx);
		const testServer = await createAppWithQuestions(ctx);

		const response = await testServer.get(url, {
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
		ctx.assert.fileSnapshot(text, path.join(snapshotsDir(), snapshotName + '.html'), {
			serializers: [(v) => v]
		});
	}

	/**
	 * @param {import('node:test').TestContext} ctx
	 * @param {string} url
	 * @param {import('#src/questions/question.js')} q
	 * @returns {Promise<string>}
	 */
	async function postQuestionCheck(ctx, url, q) {
		const testServer = await createAppWithQuestions(ctx);
		const payload = mockAnswerBody(q);
		const response = await testServer.post(url, payload, { redirect: 'manual' });
		if (![302, 303].includes(response.status)) {
			const text = await response.text();
			console.log(`Response for ${q.url}:\n`, text);
		}
		// Should redirect (302 or 303)
		assert.ok([302, 303].includes(response.status), `Expected redirect, got ${response.status}`);
		// Should redirect to the next question (if there is one)
		return response.headers.get('location');
	}

	for (let i = 0; i < questionsInOrder.length; i++) {
		const q = questionsInOrder[i];

		it(`should render question: ${q.url}`, async (ctx) => {
			await renderQuestionCheck(ctx, '/questions/' + q.url, q.url, q);
		});

		it(`should POST valid data for question: ${q.url} and redirect to next`, async (ctx) => {
			const location = await postQuestionCheck(ctx, `/questions/${q.url}`, q);
			const nextQ = questionsInOrder[i + 1];
			if (nextQ) {
				assert.strictEqual(location, `questions/${nextQ.url}`);
			} else {
				assert.strictEqual(location, 'check-your-answers');
			}
		});
	}

	describe('manage list questions', () => {
		for (const { manageListQuestion, questions } of manageListQuestions) {
			const qUrl = (q) => ['questions', manageListQuestion.url, 'add', 'id', q.url].join('/');
			for (let i = 0; i < questions.length; i++) {
				const q = questions[i];
				it(`should render question: ${q.url}`, async (ctx) => {
					await renderQuestionCheck(ctx, '/' + qUrl(q), manageListQuestion.url + '_' + q.url, q);
				});

				it(`should POST valid data for question: ${q.url} and redirect to next`, async (ctx) => {
					const location = await postQuestionCheck(ctx, '/' + qUrl(q), q);
					const nextQ = questions[i + 1];
					if (nextQ) {
						assert.strictEqual(location, qUrl(nextQ));
					} else {
						// at the end of the manage list section, return to the manage list question
						assert.strictEqual(location, 'questions/' + manageListQuestion.url);
					}
				});
			}
		}
	});
});
