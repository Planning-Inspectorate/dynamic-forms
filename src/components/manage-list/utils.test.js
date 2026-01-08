import { describe, it } from 'node:test';
import assert from 'node:assert';
import { answerObjectForManageList } from '#src/components/manage-list/utils.js';

describe('manage-list-utils', () => {
	describe('answerObjectForManageList', () => {
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
			const params = { manageListItemId: '1' };
			const got = answerObjectForManageList(journeyResponse, manageListQuestion, params);
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
			const params = { manageListItemId: '1' };
			let got = answerObjectForManageList(journeyResponse, manageListQuestion, params);
			assert.deepStrictEqual(got, {});
			// also fallback to {} if there is no manageListQuestion answer
			delete journeyResponse.answers.manageListQuestion;
			got = answerObjectForManageList(journeyResponse, manageListQuestion, params);
			assert.deepStrictEqual(got, {});
		});
	});
});
