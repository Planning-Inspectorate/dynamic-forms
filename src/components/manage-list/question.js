import { Question } from '../../questions/question.js';
import { Uuid } from '#src/lib/uuid.js';

export default class ManageListQuestion extends Question {
	/** @type {import('../../section.js').Section} */
	#section;

	/**
	 * @param {import('#question-types').QuestionParameters & {titleSingular: string, showManageListQuestions: boolean}} params
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

	prepQuestionForRendering(section, journey, customViewData, payload) {
		const viewModel = super.prepQuestionForRendering(section, journey, customViewData, payload);
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
		return viewModel;
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
		return this.section.questions.map((q) => {
			const formatted = q
				.formatAnswerForSummary('', mockJourney, answer[q.fieldName])
				.map((a) => a.value)
				.join(', ');

			return {
				question: q.title,
				answer: formatted
			};
		});
	}

	async getDataToSave(req, journeyResponse) {
		let responseToSave = { answers: {} };
		const data = journeyResponse.answers[this.fieldName];
		responseToSave.answers[this.fieldName] = data || [];
		return responseToSave;
	}

	formatAnswerForSummary(sectionSegment, journey, answer, capitals = true) {
		if (answer && Array.isArray(answer)) {
			answer = `${answer.length} ${this.title}`;
		}
		return super.formatAnswerForSummary(sectionSegment, journey, answer, capitals);
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
