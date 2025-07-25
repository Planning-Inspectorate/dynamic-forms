import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import TextEntryRedactQuestion from './question.js';
import { configureNunjucks } from '../../lib/test-utils.js';

describe('./src/dynamic-forms/components/text-entry-redact/question.js', () => {
	const TITLE = 'title';
	const QUESTION = 'Question?';
	const FIELDNAME = 'field-name';
	const VALIDATORS = [1, 2];
	const HTML = '/path/to/html.njk';
	const HINT = 'hint';
	const LABEL = 'A label';

	function createQuestion(showSuggestionsUi = false) {
		return new TextEntryRedactQuestion({
			title: TITLE,
			question: QUESTION,
			fieldName: FIELDNAME,
			validators: VALIDATORS,
			html: HTML,
			hint: HINT,
			label: LABEL,
			showSuggestionsUi
		});
	}
	it('should create', () => {
		const question = createQuestion();

		assert.strictEqual(question.title, TITLE);
		assert.strictEqual(question.question, QUESTION);
		assert.strictEqual(question.fieldName, FIELDNAME);
		assert.strictEqual(question.viewFolder, 'text-entry-redact');
		assert.strictEqual(question.validators, VALIDATORS);
		assert.strictEqual(question.html, HTML);
		assert.strictEqual(question.hint, HINT);
		assert.strictEqual(question.label, LABEL);
	});
	it('should render default view', () => {
		const question = createQuestion();
		const section = {
			name: 'section-name'
		};
		const journey = {
			baseUrl: '',
			taskListUrl: 'task',
			journeyTemplate: 'template',
			journeyTitle: 'title',
			journeyId: 'manage-representations',
			getBackLink: () => {
				return 'back';
			},
			response: {
				answers: {}
			}
		};
		const customViewData = {
			layoutTemplate: 'lib/test-layout.njk',
			question: {
				question: 'Redaction Question',
				fieldName: 'field-name',
				value: 'value',
				valueRedacted: 'value-redacted'
			}
		};
		const nunjucks = configureNunjucks();
		const mockRes = {
			render: mock.fn((view, data) => nunjucks.render(view + '.njk', data))
		};
		const viewModel = question.prepQuestionForRendering(section, journey, customViewData);
		question.renderAction(mockRes, viewModel);
		assert.strictEqual(mockRes.render.mock.callCount(), 1);
		const view = mockRes.render.mock.calls[0].result;
		assert.ok(view);
		assert.match(view, /Redaction Question/);
		assert.doesNotMatch(view, /Redaction suggestions/);
	});
	it('should render suggestions view', () => {
		const question = createQuestion(true);
		const section = {
			name: 'section-name'
		};
		const journey = {
			baseUrl: '',
			taskListUrl: 'task',
			journeyTemplate: 'template',
			journeyTitle: 'title',
			journeyId: 'manage-representations',
			getBackLink: () => {
				return 'back';
			},
			response: {
				answers: {}
			}
		};
		const customViewData = {
			layoutTemplate: 'lib/test-layout.njk',
			question: {
				question: 'Redaction Question',
				fieldName: 'field-name',
				value: 'value',
				valueRedacted: 'value-redacted'
			}
		};
		const nunjucks = configureNunjucks();
		const mockRes = {
			render: mock.fn((view, data) => nunjucks.render(view + '.njk', data))
		};
		const viewModel = question.prepQuestionForRendering(section, journey, customViewData);
		question.renderAction(mockRes, viewModel);
		assert.strictEqual(mockRes.render.mock.callCount(), 1);
		const view = mockRes.render.mock.calls[0].result;
		assert.ok(view);
		assert.match(view, /Redaction Question/);
		assert.match(view, /Redaction suggestions/);
		assert.match(view, /No redaction suggestions found\./);
	});
	it('should render suggestions view with data', () => {
		const question = createQuestion(true);
		const section = {
			name: 'section-name'
		};
		const journey = {
			baseUrl: '',
			taskListUrl: 'task',
			journeyTemplate: 'template',
			journeyTitle: 'title',
			journeyId: 'manage-representations',
			getBackLink: () => {
				return 'back';
			},
			response: {
				answers: {}
			}
		};
		const customViewData = {
			layoutTemplate: 'lib/test-layout.njk',
			question: {
				question: 'Redaction Question',
				fieldName: 'field-name',
				value: 'value',
				valueRedacted: 'value-redacted'
			},
			redactionSuggestions: [
				{ category: 'Person', suggestion: 'Test Person' },
				{ category: 'Address', suggestion: '123 Fake Street' }
			]
		};
		const nunjucks = configureNunjucks();
		const mockRes = {
			render: mock.fn((view, data) => nunjucks.render(view + '.njk', data))
		};
		const viewModel = question.prepQuestionForRendering(section, journey, customViewData);
		question.renderAction(mockRes, viewModel);
		assert.strictEqual(mockRes.render.mock.callCount(), 1);
		const view = mockRes.render.mock.calls[0].result;
		assert.ok(view);
		assert.match(view, /Redaction Question/);
		assert.match(view, /Redaction suggestions/);
		assert.match(view, /We have suggested some common redactions/);
	});
});
