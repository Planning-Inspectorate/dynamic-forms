/**
 * @class
 */
export default class SingleLineInputQuestion {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
	 * @param {Record<string, string>} [params.inputAttributes] html attributes to add to the input
	 * @param {string} [params.classes] html classes to add to the input
	 */
	constructor(params: any);
	/** @type {Record<string, string>} */
	inputAttributes: Record<string, string>;
	label: any;
	classes: any;
	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel: any): void;
}
