import { describe, it } from 'node:test';
import assert from 'node:assert';
import SingleLineInputQuestion from './question.ts';

describe('./src/dynamic-forms/components/single-line-input/question.ts', () => {
	it('should create', () => {
		const TITLE = 'title';
		const QUESTION = 'Question?';
		const FIELDNAME = 'field-name';
		const VALIDATORS = [1, 2];
		const HTML = '/path/to/html.njk';
		const HINT = 'hint';
		const LABEL = 'A label';
		const PREFIX = { text: '£', classes: 'govuk-!-font-weight-bold' };
		const SUFFIX = { text: 'per year' };

		const question = new SingleLineInputQuestion({
			title: TITLE,
			question: QUESTION,
			fieldName: FIELDNAME,
			validators: VALIDATORS,
			html: HTML,
			hint: HINT,
			label: LABEL,
			prefix: PREFIX,
			suffix: SUFFIX,
			autocomplete: FIELDNAME
		});

		assert.strictEqual(question.title, TITLE);
		assert.strictEqual(question.question, QUESTION);
		assert.strictEqual(question.fieldName, FIELDNAME);
		assert.strictEqual(question.viewFolder, 'single-line-input');
		assert.strictEqual(question.validators, VALIDATORS);
		assert.strictEqual(question.html, HTML);
		assert.strictEqual(question.hint, HINT);
		assert.strictEqual(question.label, LABEL);
		assert.strictEqual(question.prefix, PREFIX);
		assert.strictEqual(question.suffix, SUFFIX);
		assert.strictEqual(question.autocomplete, FIELDNAME);
	});
});
