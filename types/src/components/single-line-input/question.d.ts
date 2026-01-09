/**
 * @class
 */
export default class SingleLineInputQuestion extends Question {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
	 * @param {Record<string, string>} [params.inputAttributes] html attributes to add to the input
	 * @param {string} [params.classes] html classes to add to the input
	 */
	constructor(params: import('#question-types').QuestionParameters);
	/** @type {Record<string, string>} */
	inputAttributes: Record<string, string>;
	label: any;
	classes: any;
}
import { Question } from '#question';
