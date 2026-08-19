import { describe, it } from 'node:test';
import assert from 'node:assert';
import NumberEntryQuestion from '#src/components/number-entry/question.js';

describe('number-entry', () => {
	it('should allow capitaliseAnswer override', () => {
		const question = new NumberEntryQuestion({
			title: 'Question',
			question: 'Question',
			fieldName: 'question',
			url: 'Question',
			capitaliseAnswer: true
		});

		assert.strictEqual(question.capitaliseAnswer, true);
	});
});
