import { Question } from '#question';
import { Uuid } from '#src/lib/uuid.js';
import { nunjucksEnv } from '#src/components/utils/nunjucks.js';

/**
 * @typedef {Object} ManageListQuestionParameters
 * @property {string} titleSingular - the single name of the list item, e.g. "Holiday activity"
 * @property {boolean} [showManageListQuestions] - whether to show the question titles as well as answers on the manage list summary page
 * @property {boolean} [showAnswersInSummary] - whether to show the answers on the main check-your-answers page (or just a count)
 */

export default class ManageListQuestion extends Question {
	/** @type {import('../../section.js').Section} */
	#section;
	/** @type {boolean} */
	#showAnswersInSummary;

	/**
	 * @param {import('#question-types').QuestionParameters & ManageListQuestionParameters} params
	 */
	constructor(params) {
		super({
			...params,
			pageTitle: params.title,
			viewFolder: 'manage-list',
			viewData: {
				...params.viewData,
				titleSingular: params.titleSingular,
				showManageListQuestions: params.showManageListQuestions
			}
		});
		this.#showAnswersInSummary = params.showAnswersInSummary || false;
	}

	/**
	 * Is this question a manage list question?
	 *
	 * Used by controller and other logic.
	 * Added as a getter so custom components can also be a manage list question.
	 *
	 * @returns {boolean}
	 */
	get isManageListQuestion() {
		return true;
	}

	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel) {
		viewModel.question.addAnotherLink = this.#addAnotherLink;
		viewModel.question.firstQuestionUrl = this.#firstQuestionUrl;
		viewModel.question.valueSummary = [];
		if (viewModel.question.value && Array.isArray(viewModel.question.value)) {
			viewModel.question.valueSummary = viewModel.question.value.map((v) => {
				return {
					id: v.id,
					value: this.#formatItemAnswers(v)
				};
			});
		}
	}

	/**
	 * Format the answers to each of the manage list questions
	 * @param {{id: string, [k: string]: string}} answer
	 * @returns {{question: string, answer: string}[]}
	 */
	#formatItemAnswers(answer) {
		if (this.section.questions.length === 0) {
			return [];
		}
		const mockJourney = {
			getCurrentQuestionUrl() {}
		};
		return (
			this.section.questions
				// only show questions which should be displayed based on any conditional logic
				.filter((q) => q.shouldDisplay({ answers: answer }))
				.map((q) => {
					const formatted = q
						.formatAnswerForSummary('', mockJourney, answer[q.fieldName])
						.map((a) => a.value)
						.join(', ');

					return {
						question: q.title,
						answer: formatted
					};
				})
		);
	}

	async getDataToSave(req, journeyResponse) {
		let responseToSave = { answers: {} };
		const data = journeyResponse.answers[this.fieldName];
		responseToSave.answers[this.fieldName] = data || [];
		return responseToSave;
	}

	formatAnswerForSummary(sectionSegment, journey, answer) {
		let formattedAnswer = this.notStartedText;
		if (answer && Array.isArray(answer)) {
			if (this.#showAnswersInSummary) {
				const answers = answer.map((a) => this.#formatItemAnswers(a));
				formattedAnswer = nunjucksEnv().render('components/manage-list/answer-summary-list.njk', { answers });
			} else if (answer.length > 0) {
				formattedAnswer = `${answer.length} ${this.title}`;
			}
		}
		const action = this.getAction(sectionSegment, journey, answer);
		const key = this.title ?? this.question;
		return [
			{
				key: key,
				value: formattedAnswer,
				action: action
			}
		];
	}

	/**
	 * Create an 'add another' link,
	 * to the first question in the manage list section
	 *
	 * @returns {string}
	 */
	get #addAnotherLink() {
		if (this.section.questions.length === 0) {
			return '';
		}
		const nextItemId = Uuid.randomUUID();
		const firstQuestion = this.#firstQuestionUrl;
		return `add/${nextItemId}/${firstQuestion}`;
	}

	/**
	 * First question URL
	 *
	 * @returns {string}
	 */
	get #firstQuestionUrl() {
		if (this.section.questions.length === 0) {
			return '';
		}
		return this.section.questions[0].url;
	}

	get section() {
		if (!this.#section) {
			throw new Error('manage list section not set');
		}
		return this.#section;
	}

	set section(section) {
		this.#section = section;
	}
}
