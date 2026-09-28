import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { DynamicSection } from '#src/dynamic-section.js';
import { SECTION_STATUS } from '#section';
import { Question } from '#question';

// use a real question to avoid mocking lots of logic
const mockQuestion = (fieldName = 'fieldName', required = true) =>
	new Question({
		fieldName: fieldName,
		title: 'question',
		question: 'question',
		viewFolder: 'folder',
		validators: [
			{
				isRequired() {
					return required;
				}
			}
		]
	});

describe('dynamic-section', () => {
	describe('responseForSection', () => {
		it('should return inner object for dynamic section', () => {
			const section = new DynamicSection('s1', 'id-1', 'myList');
			const answers = { id: 'id-1', myField: 'answer' };
			const res = {
				answers: {
					myList: [{ id: 'id-2' }, { id: 'id-3' }, answers]
				}
			};
			const got = section.getResponse(res);
			assert.strictEqual(got?.answers, answers);
		});
	});

	describe('getStatus', () => {
		it('should use section answers for status', () => {
			const s1Answers = { id: 'S', fieldOne: 'answer' };
			const mockJourneyResponse = {
				answers: {
					visitFrequently: 'Answer 1',
					anotherFieldName: 'Answer 2',
					myList: [s1Answers]
				}
			};

			const requiredQuestion = mockQuestion('visitFrequently');

			const section = new DynamicSection('s1', 'S', 'myList');
			section.addQuestion(requiredQuestion);

			mock.method(requiredQuestion, 'shouldDisplay');
			mock.method(requiredQuestion, 'isAnswered');

			section.getStatus(mockJourneyResponse);

			assert.strictEqual(requiredQuestion.shouldDisplay.mock.callCount(), 1);
			assert.strictEqual(requiredQuestion.isAnswered.mock.callCount(), 2);
			assert.strictEqual(requiredQuestion.shouldDisplay.mock.calls[0].arguments[0].answers, s1Answers);
			assert.strictEqual(requiredQuestion.isAnswered.mock.calls[0].arguments[0].answers, s1Answers);
		});

		it('should return NOT_STARTED when no answers are given', () => {
			const mockJourneyResponse = {
				answers: {}
			};
			const section = new DynamicSection('s1', 'S', 'myList');
			section.addQuestion(mockQuestion());
			const result = section.getStatus(mockJourneyResponse);
			assert.strictEqual(result, SECTION_STATUS.NOT_STARTED);
			const isComplete = section.isComplete(mockJourneyResponse);
			assert.strictEqual(isComplete, false);
		});

		it('should return IN_PROGRESS when at least one answer is given', () => {
			const mockJourneyResponse = {
				answers: {
					myList: [{ id: 'S', visitFrequently: 'Answer 1' }]
				}
			};

			const section = new DynamicSection('s1', 'S', 'myList');
			section.addQuestion(mockQuestion());
			section.addQuestion(mockQuestion('visitFrequently'));
			const result = section.getStatus(mockJourneyResponse);
			assert.strictEqual(result, SECTION_STATUS.IN_PROGRESS);
			const isComplete = section.isComplete(mockJourneyResponse);
			assert.strictEqual(isComplete, false);
		});

		it('should return COMPLETE when all required answers are given', () => {
			const s1Answers = { id: 'S', visitFrequently: 'answer', anotherFieldName: true };
			const mockJourneyResponse = {
				answers: {
					myList: [s1Answers]
				}
			};

			const section = new DynamicSection('s1', 'S', 'myList');
			section.addQuestion(mockQuestion('visitFrequently'));
			section.addQuestion(mockQuestion('anotherFieldName'));
			section.addQuestion(mockQuestion('someQuestion', false));

			const result = section.getStatus(mockJourneyResponse);
			assert.strictEqual(result, SECTION_STATUS.COMPLETE);

			const isComplete = section.isComplete(mockJourneyResponse);
			assert.strictEqual(isComplete, true);
		});
	});
});
