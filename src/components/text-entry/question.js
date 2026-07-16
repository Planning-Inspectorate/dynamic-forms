import { Question } from '#question';
/**
 * @import {QuestionViewModel} from '#question'
 * @import {Journey} from '#journey'
 * @import {JourneyResponse} from '#journey-response'
 * @import {Section} from '#section'
 */

/**
 * @typedef {Object} TextEntryCheckbox
 * @property {string} header
 * @property {string} text
 * @property {string} name
 * @property {string} [errorMessage]
 */

/**
 * @class
 */
export class TextEntryQuestion extends Question {
	/**
	 * @param {import('../../questions/question-props.d.ts').TextEntryQuestionParams} params
	 */
	constructor({ textEntryCheckbox, label, ...parentParams }) {
		super({
			...parentParams,
			viewFolder: 'text-entry'
		});

		this.textEntryCheckbox = textEntryCheckbox;
		this.label = label;
	}

	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel) {
		viewModel.question.label = this.label;
		viewModel.question.textEntryCheckbox = this.textEntryCheckbox;
	}
}

export default TextEntryQuestion;
