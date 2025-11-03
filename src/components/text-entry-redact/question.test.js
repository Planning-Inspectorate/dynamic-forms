import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import TextEntryRedactQuestion from './question.js';
import { configureNunjucksTestEnv } from '../../../test/utils/nunjucks.js';

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
			layoutTemplate: 'views/layout-journey.njk',
			question: {
				question: 'Redaction Question',
				fieldName: 'field-name',
				value: 'value',
				valueRedacted: 'value-redacted'
			}
		};
		const nunjucks = configureNunjucksTestEnv();
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
			layoutTemplate: 'views/layout-journey.njk',
			question: {
				question: 'Redaction Question',
				fieldName: 'field-name',
				value: 'value',
				valueRedacted: 'value-redacted'
			}
		};
		const nunjucks = configureNunjucksTestEnv();
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
			layoutTemplate: 'views/layout-journey.njk',
			question: {
				question: 'Redaction Question',
				fieldName: 'field-name',
				value: 'value',
				valueRedacted: 'value-redacted',
				valueOriginal: 'value'
			},
			redactionSuggestions: [
				{ category: 'Person', suggestion: 'Test Person' },
				{ category: 'Address', suggestion: '123 Fake Street' }
			]
		};
		const nunjucks = configureNunjucksTestEnv();
		const mockRes = {
			render: mock.fn((view, data) => nunjucks.render(view + '.njk', data))
		};
		const viewModel = question.prepQuestionForRendering(section, journey, customViewData);
		assert.strictEqual(viewModel.question.valueOriginal, 'value');
		question.renderAction(mockRes, viewModel);
		assert.strictEqual(mockRes.render.mock.callCount(), 1);
		const view = mockRes.render.mock.calls[0].result;
		assert.ok(view);
		assert.match(view, /Redaction Question/);
		assert.match(view, /Redaction suggestions/);
		assert.match(view, /We have suggested some common redactions/);
		assert.match(view, /data-original="value"/);
	});
	it('should use <br> tags for newlines', () => {
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
			layoutTemplate: 'views/layout-journey.njk',
			question: {
				question: 'Redaction Question',
				fieldName: 'field-name',
				value: 'This is my comment.\nIt has multiple lines.\r\nHere is another line.',
				valueRedacted: 'value-redacted'
			},
			redactionSuggestions: [
				{ category: 'Person', suggestion: 'Test Person' },
				{ category: 'Address', suggestion: '123 Fake Street' }
			]
		};
		const nunjucks = configureNunjucksTestEnv();
		const mockRes = {
			render: mock.fn((view, data) => nunjucks.render(view + '.njk', data))
		};
		const viewModel = question.prepQuestionForRendering(section, journey, customViewData);
		question.renderAction(mockRes, viewModel);
		assert.strictEqual(mockRes.render.mock.callCount(), 1);
		const view = mockRes.render.mock.calls[0].result;
		assert.ok(view);
		assert.match(view, /This is my comment\.<br>It has multiple lines\.<br>Here is another line\./);
	});
	it('should format answer for summary', () => {
		const question = createQuestion();
		const journey = {
			baseUrl: '',
			taskListUrl: 'task',
			journeyTemplate: 'template',
			journeyTitle: 'title',
			journeyId: 'manage-representations',
			getBackLink: () => {
				return 'back';
			},
			getCurrentQuestionUrl: () => {
				return '/redacted-comment';
			},
			response: {
				answers: {}
			}
		};
		const answer =
			'It began with an ordinary morning. The air smelled faintly of dew, the street empty but for leaves drifting lazily. ████████ ██████ adjusted his collar, noting his watch was three minutes late—a stubborn old thing, loyal only to its own time. Across the street, a bakery opened, the scent of bread spilling into the cool air. A woman in a green scarf carried loaves in quiet balance. The square stirred slowly; ████████ wrote in his notebook, letting the day delay his errands, wholly unhurried and serene.';

		const viewModel = question.formatAnswerForSummary('section', journey, answer);

		assert.deepStrictEqual(viewModel, [
			{
				key: 'title',
				value:
					'It began with an ordinary morning. The air smelled faintly of dew, the street empty but for leaves drifting lazily. ████████ ██████ adjusted his collar, noting his watch was three minutes late—a stubborn old thing, loyal only to its own time. Across the street, a bakery opened, the scent of bread spilling into the cool air. A woman in a green scarf carried loaves in quiet balance. The square stirred slowly; ████████ wrote in his notebook, letting the day delay his errands, wholly unhurried and serene.',
				action: {
					href: '/redacted-comment',
					text: 'Change',
					visuallyHiddenText: 'Question?'
				}
			}
		]);
	});
	it('should truncate when formating answer for summary when shouldTruncateSummary is true', () => {
		const question = createQuestion();
		question.shouldTruncateSummary = true;
		const journey = {
			baseUrl: '',
			taskListUrl: 'task',
			journeyTemplate: 'template',
			journeyTitle: 'title',
			journeyId: 'manage-representations',
			getBackLink: () => {
				return 'back';
			},
			getCurrentQuestionUrl: () => {
				return '/redacted-comment';
			},
			response: {
				answers: {}
			}
		};
		const answer =
			'It began with an ordinary morning. The air smelled faintly of dew, the street empty but for leaves drifting lazily. ████████ ██████ adjusted his collar, noting his watch was three minutes late—a stubborn old thing, loyal only to its own time. Across the street, a bakery opened, the scent of bread spilling into the cool air. A woman in a green scarf carried loaves in quiet balance. The square stirred slowly; ████████ wrote in his notebook, letting the day delay his errands, wholly unhurried and serene.';

		const viewModel = question.formatAnswerForSummary('section', journey, answer);

		assert.deepStrictEqual(viewModel, [
			{
				key: 'title',
				value: `It began with an ordinary morning. The air smelled faintly of dew, the street empty but for leaves drifting lazily. ████████ ██████ adjusted his collar, noting his watch was three minutes late—a stubborn old thing, loyal only to its own time. Across the street, a bakery opened, the scent of bread spilling into the cool air. A woman in a green scarf carried loaves in quiet balance. The square stirred slowly; ████████ wrote in his notebook, letting the day delay his errands, wholly unhurried and s... <a class="govuk-link govuk-link--no-visited-state" href="/redacted-comment">Read more</a>`,
				action: {
					href: '/redacted-comment',
					text: 'Change',
					visuallyHiddenText: 'Question?'
				}
			}
		]);
	});
	it('should not truncate when formating answer for summary when shouldTruncateSummary is true and length less than 500', () => {
		const question = createQuestion();
		question.shouldTruncateSummary = true;
		const journey = {
			baseUrl: '',
			taskListUrl: 'task',
			journeyTemplate: 'template',
			journeyTitle: 'title',
			journeyId: 'manage-representations',
			getBackLink: () => {
				return 'back';
			},
			getCurrentQuestionUrl: () => {
				return '/redacted-comment';
			},
			response: {
				answers: {}
			}
		};
		const answer =
			'It began, as many stories do, with an ordinary morning. The air carried the faint smell of dew, and the street was empty save for a few scattered leaves drifting lazily o████████ze too shy to commit to being wind. Jonathan Price adjusted his collar and glanced at his watch, noting with mild irritation tha███████████████████████████ree minutes late.';

		const viewModel = question.formatAnswerForSummary('section', journey, answer);

		assert.deepStrictEqual(viewModel, [
			{
				key: 'title',
				value:
					'It began, as many stories do, with an ordinary morning. The air carried the faint smell of dew, and the street was empty save for a few scattered leaves drifting lazily o████████ze too shy to commit to being wind. Jonathan Price adjusted his collar and glanced at his watch, noting with mild irritation tha███████████████████████████ree minutes late.',
				action: {
					href: '/redacted-comment',
					text: 'Change',
					visuallyHiddenText: 'Question?'
				}
			}
		]);
	});
});
