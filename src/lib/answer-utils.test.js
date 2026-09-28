import { describe, it } from 'node:test';
import assert from 'node:assert';
import { answerObjectForListItem, answerObjectForListItemSaving } from '#src/lib/answer-utils.js';

describe('answer-utils', () => {
	describe('answerObjectForListItem', () => {
		it('should return the manage list item object for manage list questions', () => {
			const manageListQuestion = {
				fieldName: 'manageListQuestion'
			};
			const answers = {
				id: '1',
				myField: 'my-value'
			};
			const journeyResponse = {
				answers: {
					manageListQuestion: [answers]
				}
			};
			const manageListItemId = '1';
			const got = answerObjectForListItem(journeyResponse, manageListQuestion, manageListItemId);
			assert.strictEqual(got, answers);
		});

		it('should fallback to {} if manage list item id not found', () => {
			const manageListQuestion = {
				fieldName: 'manageListQuestion'
			};
			const answers = {
				id: '2',
				myField: 'my-value'
			};
			const journeyResponse = {
				answers: {
					manageListQuestion: [answers]
				}
			};
			const manageListItemId = '1';
			let got = answerObjectForListItem(journeyResponse, manageListQuestion, manageListItemId);
			assert.deepStrictEqual(got, {});
			// also fallback to {} if there is no manageListQuestion answer
			delete journeyResponse.answers.manageListQuestion;
			got = answerObjectForListItem(journeyResponse, manageListQuestion, manageListItemId);
			assert.deepStrictEqual(got, {});
		});
	});

	describe('answerObjectForListItemSaving', () => {
		it('should add an array with a new object if not found', () => {
			const manageListQuestion = {
				fieldName: 'manageListQuestion'
			};
			const journeyResponse = {
				answers: {}
			};
			const got = answerObjectForListItemSaving(journeyResponse, manageListQuestion, '1');
			assert.deepStrictEqual(got, { id: '1' });
			assert.ok(Array.isArray(journeyResponse.answers.manageListQuestion));
			assert.ok(journeyResponse.answers.manageListQuestion[0]?.id, '1');
		});
		it('should return the manage list item object for manage list questions', () => {
			const manageListQuestion = {
				fieldName: 'manageListQuestion'
			};
			const answers = {
				id: '1',
				myField: 'my-value'
			};
			const journeyResponse = {
				answers: {
					manageListQuestion: [answers]
				}
			};
			const got = answerObjectForListItemSaving(journeyResponse, manageListQuestion, '1');
			assert.strictEqual(got, answers);
		});
	});
});
