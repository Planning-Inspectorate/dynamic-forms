import { Question } from '../../questions/question.js';

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
