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
export default class TextEntryQuestion {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {TextEntryCheckbox} [params.textEntryCheckbox]
	 * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
	 */
	constructor({ textEntryCheckbox, label, ...params }: any);
	textEntryCheckbox: any;
	label: any;
	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel: any): void;
}
export type TextEntryCheckbox = {
	header: string;
	text: string;
	name: string;
	errorMessage?: string;
};
