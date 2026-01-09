export default class NumberEntryQuestion {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {string} [params.suffix]
	 * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
	 */
	constructor({ label, suffix, ...params }: any);
	suffix: any;
	label: any;
	answerForViewModel(answers: any): string | number;
	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel: any): void;
	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @param {Object} answer
	 * @param {import('#journey').Journey} journey
	 * @param {String} sectionSegment
	 * @returns {Array<{
	 *   key: string;
	 *   value: string | Object;
	 *   action: {
	 *     href: string;
	 *     text: string;
	 *     visuallyHiddenText: string;
	 *   };
	 * }>}
	 */
	formatAnswerForSummary(
		sectionSegment: string,
		journey: any,
		answer: any
	): Array<{
		key: string;
		value: string | any;
		action: {
			href: string;
			text: string;
			visuallyHiddenText: string;
		};
	}>;
}
