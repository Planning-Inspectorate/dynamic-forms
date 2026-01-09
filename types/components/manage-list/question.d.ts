/**
 * @typedef {Object} ManageListQuestionParameters
 * @property {string} titleSingular - the single name of the list item, e.g. "Holiday activity"
 * @property {boolean} [showManageListQuestions] - whether to show the question titles as well as answers on the manage list summary page
 * @property {boolean} [showAnswersInSummary] - whether to show the answers on the main check-your-answers page (or just a count)
 */
export default class ManageListQuestion {
	/**
	 * @param {import('#question-types').QuestionParameters & ManageListQuestionParameters} params
	 */
	constructor(params: any & ManageListQuestionParameters);
	/**
	 * Is this question a manage list question?
	 *
	 * Used by controller and other logic.
	 * Added as a getter so custom components can also be a manage list question.
	 *
	 * @returns {boolean}
	 */
	get isManageListQuestion(): boolean;
	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel: any): void;
	getDataToSave(): Promise<{
		answers: {};
	}>;
	formatAnswerForSummary(
		sectionSegment: any,
		journey: any,
		answer: any
	): {
		key: any;
		value: any;
		action: any;
	}[];
	set section(section: import('../../section.js').Section);
	get section(): import('../../section.js').Section;
	#private;
}
export type ManageListQuestionParameters = {
	/**
	 * - the single name of the list item, e.g. "Holiday activity"
	 */
	titleSingular: string;
	/**
	 * - whether to show the question titles as well as answers on the manage list summary page
	 */
	showManageListQuestions?: boolean;
	/**
	 * - whether to show the answers on the main check-your-answers page (or just a count)
	 */
	showAnswersInSummary?: boolean;
};
