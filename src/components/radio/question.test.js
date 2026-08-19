import { describe, it } from 'node:test';
import assert from 'node:assert';
import ValidOptionValidator from '../../validator/valid-option-validator.js';
import RadioQuestion from './question.js';
import nunjucks from 'nunjucks';

const TITLE = 'Radio question';
const QUESTION = 'A radio question';
const DESCRIPTION = 'A description of a radio question';
const FIELDNAME = 'radio-question';
const VIEWFOLDER = 'boolean-text';
const HTML = 'some/html/path';
const LABEL = 'a label';
const OPTIONS = [
	{
		text: 'Yes',
		value: 'yes',
		conditional: {
			question: 'Write some text',
			type: 'text'
		}
	},
	{
		text: 'No',
		value: 'no'
	}
];

const SECTION = {
	name: 'section-name'
};

const JOURNEY = {
	baseUrl: '',
	taskListUrl: 'list',
	journeyTemplate: 'template',
	journeyTitle: 'title',
	response: {
		answers: {
			[FIELDNAME]: { a: 1 }
		}
	},
	getCurrentQuestionUrl: () => {
		return '/';
	},
	getNextQuestionUrl: () => {
		return 'back';
	},
	getBackLink: () => {
		return 'back';
	}
};

describe('./src/dynamic-forms/components/radio/question.js', () => {
	it('should create', () => {
		const radioQuestion = new RadioQuestion({
			title: TITLE,
			question: QUESTION,
			description: DESCRIPTION,
			fieldName: FIELDNAME,
			html: HTML,
			label: LABEL,
			options: OPTIONS
		});

		assert.strictEqual(radioQuestion.title, TITLE);
		assert.strictEqual(radioQuestion.question, QUESTION);
		assert.strictEqual(radioQuestion.description, DESCRIPTION);
		assert.strictEqual(radioQuestion.fieldName, FIELDNAME);
		assert.strictEqual(radioQuestion.viewFolder, 'radio');
		assert.strictEqual(radioQuestion.html, HTML);
		assert.strictEqual(radioQuestion.label, LABEL);
		assert.strictEqual(radioQuestion.options, OPTIONS);
		assert.deepStrictEqual(radioQuestion.validators, [new ValidOptionValidator()]);
	});

	it('should add label property to view model when preparing question for rendering', (ctx) => {
		nunjucks.render = ctx.mock.fn();
		nunjucks.render.mock.mockImplementation(() => {});

		const radioQuestion = new RadioQuestion({
			title: TITLE,
			question: QUESTION,
			description: DESCRIPTION,
			fieldName: FIELDNAME,
			viewFolder: VIEWFOLDER,
			html: HTML,
			label: LABEL,
			options: OPTIONS
		});

		const customViewData = { hello: 'hi' };

		const preppedQuestion = radioQuestion.prepQuestionForRendering(SECTION, JOURNEY, customViewData);

		assert.strictEqual(preppedQuestion.question.label, LABEL);
	});

	describe('formatAnswer', () => {
		it('should delegate simple string answers to parent class', () => {
			const radioQuestion = new RadioQuestion({
				title: TITLE,
				question: QUESTION,
				description: DESCRIPTION,
				fieldName: FIELDNAME,
				options: [
					{ text: 'Option 1', value: 'op-1' },
					{ text: 'Option 2', value: 'op-2' }
				]
			});

			const result = radioQuestion.formatAnswer('op-1');
			assert.strictEqual(result, 'Option 1');
		});

		it('should format object answer with value only (no conditional)', () => {
			const radioQuestion = new RadioQuestion({
				title: TITLE,
				question: QUESTION,
				description: DESCRIPTION,
				fieldName: FIELDNAME,
				options: OPTIONS
			});

			const result = radioQuestion.formatAnswer({ value: 'no' });
			assert.strictEqual(result, 'No');
		});

		it('should format object answer with conditional', () => {
			const radioQuestion = new RadioQuestion({
				title: TITLE,
				question: QUESTION,
				description: DESCRIPTION,
				fieldName: FIELDNAME,
				options: OPTIONS
			});

			const result = radioQuestion.formatAnswer({
				value: 'yes',
				conditional: { yes: 'test details' }
			});
			assert.strictEqual(result, 'Yes<br>test details');
		});

		it('should format object answer with conditional and label', () => {
			const optionsWithLabel = [...OPTIONS];
			optionsWithLabel[0] = {
				...optionsWithLabel[0],
				conditional: {
					...optionsWithLabel[0].conditional,
					label: 'label:'
				}
			};
			const radioQuestion = new RadioQuestion({
				title: TITLE,
				question: QUESTION,
				description: DESCRIPTION,
				fieldName: FIELDNAME,
				options: optionsWithLabel
			});

			const result = radioQuestion.formatAnswer({
				value: 'yes',
				conditional: { yes: 'test details' }
			});
			assert.strictEqual(result, 'Yes<br>label: test details');
		});

		it('should fall back to value when option not found in object answer', () => {
			const radioQuestion = new RadioQuestion({
				title: TITLE,
				question: QUESTION,
				description: DESCRIPTION,
				fieldName: FIELDNAME,
				options: OPTIONS
			});

			const result = radioQuestion.formatAnswer({ value: 'unknown' });
			assert.strictEqual(result, 'unknown');
		});

		it('should escape HTML in option text', () => {
			const radioQuestion = new RadioQuestion({
				title: TITLE,
				question: QUESTION,
				description: DESCRIPTION,
				fieldName: FIELDNAME,
				options: [{ text: '<script>alert("xss")</script>', value: 'xss' }]
			});

			const result = radioQuestion.formatAnswer('xss');
			assert.strictEqual(result, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
		});

		it('should escape HTML in conditional value', () => {
			const radioQuestion = new RadioQuestion({
				title: TITLE,
				question: QUESTION,
				description: DESCRIPTION,
				fieldName: FIELDNAME,
				options: [
					{
						text: 'Yes',
						value: 'yes',
						conditional: { fieldName: 'details', type: 'text' }
					}
				]
			});

			const result = radioQuestion.formatAnswer({
				value: 'yes',
				conditional: { yes: '<img src=x onerror=alert(1)>' }
			});
			assert.strictEqual(result, 'Yes<br>&lt;img src=x onerror=alert(1)&gt;');
		});

		it('should escape HTML in conditional label', () => {
			const radioQuestion = new RadioQuestion({
				title: TITLE,
				question: QUESTION,
				description: DESCRIPTION,
				fieldName: FIELDNAME,
				options: [
					{
						text: 'Yes',
						value: 'yes',
						conditional: { fieldName: 'details', type: 'text', label: '<b>Label</b>' }
					}
				]
			});

			const result = radioQuestion.formatAnswer({
				value: 'yes',
				conditional: { yes: 'safe value' }
			});
			assert.strictEqual(result, 'Yes<br>&lt;b&gt;Label&lt;/b&gt; safe value');
		});

		it('should escape HTML in fallback value when option not found', () => {
			const radioQuestion = new RadioQuestion({
				title: TITLE,
				question: QUESTION,
				description: DESCRIPTION,
				fieldName: FIELDNAME,
				options: OPTIONS
			});

			const result = radioQuestion.formatAnswer({ value: '<script>xss</script>' });
			assert.strictEqual(result, '&lt;script&gt;xss&lt;/script&gt;');
		});
	});
});
