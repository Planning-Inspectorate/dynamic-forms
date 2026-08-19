import { describe, it } from 'node:test';
import assert from 'node:assert';
import CheckboxQuestion from './question.js';
import ValidOptionValidator from '../../validator/valid-option-validator.js';

describe('./src/dynamic-forms/components/checkbox/question.js', () => {
	const TITLE = 'title';
	const QUESTION = 'Question?';
	const DESCRIPTION = 'Describe';
	const FIELDNAME = 'field-name';
	const CONDITIONAL_FIELDNAME = 'conditional-field-name';
	const URL = 'url';
	const PAGE_TITLE = 'this appears in <title>';
	const VALIDATORS = [1, 2];
	const OPTIONS = [
		{ text: 'a', value: '1' },
		{ text: 'b', value: '2' },
		{
			text: 'c',
			value: '3',
			conditional: {
				fieldName: CONDITIONAL_FIELDNAME
			}
		}
	];
	const CHECKBOX_PARAMS = {
		title: TITLE,
		question: QUESTION,
		description: DESCRIPTION,
		fieldName: FIELDNAME,
		url: URL,
		pageTitle: PAGE_TITLE,
		validators: VALIDATORS,
		options: OPTIONS
	};
	const CONDITIONAL_ANSWER_TEXT = 'a conditional answer';
	const JOURNEY = {
		response: {
			answers: {}
		}
	};
	JOURNEY.response.answers[`${FIELDNAME}_${CONDITIONAL_FIELDNAME}`] = CONDITIONAL_ANSWER_TEXT;
	it('should create', () => {
		const question = new CheckboxQuestion(CHECKBOX_PARAMS);

		assert.strictEqual(question.title, TITLE);
		assert.strictEqual(question.question, QUESTION);
		assert.strictEqual(question.description, DESCRIPTION);
		assert.strictEqual(question.fieldName, FIELDNAME);
		assert.strictEqual(question.viewFolder, 'checkbox');
		assert.strictEqual(question.url, URL);
		assert.strictEqual(question.pageTitle, PAGE_TITLE);
		assert.deepStrictEqual(question.validators, [...VALIDATORS, new ValidOptionValidator()]);
		assert.deepStrictEqual(question.options, OPTIONS);
	});
	it('should allow capitaliseAnswer override', () => {
		const question = new CheckboxQuestion({
			...CHECKBOX_PARAMS,
			capitaliseAnswer: true
		});

		assert.strictEqual(question.capitaliseAnswer, true);
	});

	describe('formatAnswer', () => {
		it('should delegate simple string answers to parent class', () => {
			const question = new CheckboxQuestion(CHECKBOX_PARAMS);
			// Simple string should use parent's formatAnswer
			const result = question.formatAnswer('1,2');
			assert.strictEqual(result, 'a<br>b');
		});

		it('should format single answer with conditional', () => {
			const question = new CheckboxQuestion(CHECKBOX_PARAMS);
			const answer = {
				value: '3',
				conditional: {
					3: 'conditional details'
				}
			};
			const result = question.formatAnswer(answer);
			assert.strictEqual(result, 'c<br>conditional details');
		});

		it('should format single answer with conditional and label', () => {
			const optionsWithLabel = [
				{ text: 'Option A', value: 'a' },
				{
					text: 'Option B',
					value: 'b',
					conditional: {
						fieldName: 'details',
						label: 'Please provide details:'
					}
				}
			];
			const question = new CheckboxQuestion({
				...CHECKBOX_PARAMS,
				options: optionsWithLabel
			});
			const answer = {
				value: 'b',
				conditional: {
					b: 'my details'
				}
			};
			const result = question.formatAnswer(answer);
			assert.strictEqual(result, 'Option B<br>Please provide details: my details');
		});

		it('should format multiple answers where one has conditional', () => {
			const question = new CheckboxQuestion(CHECKBOX_PARAMS);
			const answer = {
				value: '1,3',
				conditional: {
					3: 'conditional for c'
				}
			};
			const result = question.formatAnswer(answer);
			assert.strictEqual(result, 'a<br>c<br>conditional for c');
		});

		it('should format multiple answers with multiple conditionals', () => {
			const optionsWithMultipleConditionals = [
				{
					text: 'Option A',
					value: 'a',
					conditional: { fieldName: 'details-a' }
				},
				{ text: 'Option B', value: 'b' },
				{
					text: 'Option C',
					value: 'c',
					conditional: { fieldName: 'details-c' }
				}
			];
			const question = new CheckboxQuestion({
				...CHECKBOX_PARAMS,
				options: optionsWithMultipleConditionals
			});
			const answer = {
				value: 'a,c',
				conditional: {
					a: 'details for A',
					c: 'details for C'
				}
			};
			const result = question.formatAnswer(answer);
			assert.strictEqual(result, 'Option A<br>details for A<br>Option C<br>details for C');
		});

		it('should handle object answer with empty conditional', () => {
			const question = new CheckboxQuestion(CHECKBOX_PARAMS);
			const answer = {
				value: '1,2',
				conditional: {}
			};
			const result = question.formatAnswer(answer);
			assert.strictEqual(result, 'a<br>b');
		});

		it('should handle object answer with null conditional', () => {
			const question = new CheckboxQuestion(CHECKBOX_PARAMS);
			const answer = {
				value: '1,2',
				conditional: null
			};
			const result = question.formatAnswer(answer);
			assert.strictEqual(result, 'a<br>b');
		});

		it('should fall back to value when option not found in object answer', () => {
			const question = new CheckboxQuestion(CHECKBOX_PARAMS);
			const answer = {
				value: 'unknown',
				conditional: {}
			};
			const result = question.formatAnswer(answer);
			assert.strictEqual(result, 'unknown');
		});

		it('should escape HTML in option text', () => {
			const question = new CheckboxQuestion({
				...CHECKBOX_PARAMS,
				options: [{ text: '<script>alert("xss")</script>', value: '1' }]
			});
			const result = question.formatAnswer('1');
			assert.strictEqual(result, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
		});

		it('should escape HTML in conditional value', () => {
			const question = new CheckboxQuestion({
				...CHECKBOX_PARAMS,
				options: [
					{
						text: 'Option',
						value: '1',
						conditional: { fieldName: 'details', type: 'text' }
					}
				]
			});
			const answer = {
				value: '1',
				conditional: { 1: '<img src=x onerror=alert(1)>' }
			};
			const result = question.formatAnswer(answer);
			assert.strictEqual(result, 'Option<br>&lt;img src=x onerror=alert(1)&gt;');
		});

		it('should escape HTML in conditional label', () => {
			const question = new CheckboxQuestion({
				...CHECKBOX_PARAMS,
				options: [
					{
						text: 'Option',
						value: '1',
						conditional: { fieldName: 'details', type: 'text', label: '<b>Label</b>' }
					}
				]
			});
			const answer = {
				value: '1',
				conditional: { 1: 'safe value' }
			};
			const result = question.formatAnswer(answer);
			assert.strictEqual(result, 'Option<br>&lt;b&gt;Label&lt;/b&gt; safe value');
		});

		it('should escape HTML in fallback value when option not found', () => {
			const question = new CheckboxQuestion(CHECKBOX_PARAMS);
			const answer = {
				value: '<script>xss</script>',
				conditional: {}
			};
			const result = question.formatAnswer(answer);
			assert.strictEqual(result, '&lt;script&gt;xss&lt;/script&gt;');
		});
	});
});
