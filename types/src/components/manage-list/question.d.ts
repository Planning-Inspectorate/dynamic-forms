/**
 * @typedef {Object} ManageListQuestionParameters
 * @property {string} titleSingular - the single name of the list item, e.g. "Holiday activity"
 * @property {boolean} [showManageListQuestions] - whether to show the question titles as well as answers on the manage list summary page
 * @property {boolean} [showAnswersInSummary] - whether to show the answers on the main check-your-answers page (or just a count)
 */
export default class ManageListQuestion extends Question {
	/**
	 * @param {import('#question-types').QuestionParameters & ManageListQuestionParameters} params
	 */
	constructor(params: import('#question-types').QuestionParameters & ManageListQuestionParameters);
	getDataToSave(): Promise<{
		answers: {};
	}>;
	formatAnswerForSummary(
		sectionSegment: any,
		journey: any,
		answer: any
	): {
		key: string;
		value: string;
		action: import('../../controller.js').ActionView | import('../../controller.js').ActionView[] | undefined;
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
	showManageListQuestions?: boolean | undefined;
	/**
	 * - whether to show the answers on the main check-your-answers page (or just a count)
	 */
	showAnswersInSummary?: boolean | undefined;
};
import { Question } from '#question';
//# sourceMappingURL=question.d.ts.map
