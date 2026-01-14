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
export default class TextEntryQuestion extends Question {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {TextEntryCheckbox} [params.textEntryCheckbox]
	 * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
	 */
	constructor({ textEntryCheckbox, label, ...params }: import('#question-types').QuestionParameters);
	textEntryCheckbox: any;
	label: any;
}
export type TextEntryCheckbox = {
	header: string;
	text: string;
	name: string;
	errorMessage?: string | undefined;
};
import { Question } from '#question';
//# sourceMappingURL=question.d.ts.map
