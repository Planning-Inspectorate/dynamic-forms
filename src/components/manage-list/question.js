import { Question } from '../../questions/question.js';
import { Uuid } from '#src/lib/uuid.js';

export default class ManageListQuestion extends Question {
	/** @type {import('../../section.js').Section} */
	#section;

	/**
	 * @param {import('#question-types').QuestionParameters} params
	 */
	constructor(params) {
		super({
			...params,
			pageTitle: params.title,
			viewFolder: 'manage-list'
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
		return viewModel;
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
		const firstQuestion = this.section.questions[0].url;
		return `add/${nextItemId}/${firstQuestion}`;
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
