import { describe, it } from 'node:test';
import assert from 'node:assert';
import NumberEntryQuestion from './question.ts';

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

	it('should accept Affix objects for prefix and suffix', () => {
		const PREFIX = { text: '£', classes: 'govuk-!-font-weight-bold' };
		const SUFFIX = { text: 'kg' };

		const question = new NumberEntryQuestion({
			title: 'Question',
			question: 'Question',
			fieldName: 'question',
			url: 'Question',
			prefix: PREFIX,
			suffix: SUFFIX
		});

		assert.strictEqual(question.prefix, PREFIX);
		assert.strictEqual(question.suffix, SUFFIX);
	});

	it('should convert string suffix to Affix object and warn about deprecation', (t) => {
		const warnMock = t.mock.method(console, 'warn', () => {});

		const question = new NumberEntryQuestion({
			title: 'Question',
			question: 'Question',
			fieldName: 'question',
			url: 'Question',
			suffix: 'kg'
		});

		assert.deepStrictEqual(question.suffix, { text: 'kg' });
		assert.strictEqual(warnMock.mock.calls.length, 1);
		assert.match(warnMock.mock.calls[0].arguments[0], /suffix.*deprecated/);
	});

	it('should leave prefix and suffix undefined when not provided', () => {
		const question = new NumberEntryQuestion({
			title: 'Question',
			question: 'Question',
			fieldName: 'question',
			url: 'Question'
		});

		assert.strictEqual(question.prefix, undefined);
		assert.strictEqual(question.suffix, undefined);
	});

	it('should add prefix and suffix to the view model', () => {
		const PREFIX = { text: '£' };
		const SUFFIX = { text: 'kg' };

		const question = new NumberEntryQuestion({
			title: 'Question',
			question: 'Question',
			fieldName: 'question',
			url: 'Question',
			prefix: PREFIX,
			suffix: SUFFIX
		});

		const viewModel = { question: {} };
		question.addCustomDataToViewModel(viewModel);

		assert.strictEqual(viewModel.question.prefix, PREFIX);
		assert.strictEqual(viewModel.question.suffix, SUFFIX);
	});
});
