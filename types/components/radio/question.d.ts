export default class RadioQuestion extends OptionsQuestion {
	/**
	 * @param {Object} params
	 * @param {string} params.title
	 * @param {string} params.question
	 * @param {string} params.fieldName
	 * @param {string} [params.viewFolder]
	 * @param {string} [params.url]
	 * @param {string} [params.hint]
	 * @param {string} [params.pageTitle]
	 * @param {string} [params.description]
	 * @param {string} [params.label]
	 * @param {string} [params.html]
	 * @param {string} [params.legend] - optional legend, used instead of h1
	 * @param {Array.<import('../../questions/options-question.js').Option>} params.options
	 * @param {Array.<import('#base-validator').BaseValidator>} [params.validators]
	 * @param {boolean} [params.editable]
	 * @param {Object<string, any>} [params.viewData]
	 * @param {import('../../questions/question-types.js').ActionLink} [params.actionLink]
	 */
	constructor({
		title,
		question,
		fieldName,
		viewFolder,
		url,
		hint,
		pageTitle,
		description,
		label,
		html,
		legend,
		options,
		validators,
		actionLink,
		editable,
		viewData
	}: {
		title: string;
		question: string;
		fieldName: string;
		viewFolder?: string;
		url?: string;
		hint?: string;
		pageTitle?: string;
		description?: string;
		label?: string;
		html?: string;
		legend?: string;
		options: Array<import('../../questions/options-question.js').Option>;
		validators?: Array<any>;
		editable?: boolean;
		viewData?: {
			[x: string]: any;
		};
		actionLink?: import('../../questions/question-types.js').ActionLink;
	});
	label: string;
	legend: string;
	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel: any): void;
	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @param {Object} answer
	 * @param {Journey} journey
	 * @param {String} sectionSegment
	 * @returns {Array.<Object>}
	 */
	formatAnswerForSummary(sectionSegment: string, journey: Journey, answer: any): Array<any>;
}
import OptionsQuestion from '../../questions/options-question.js';
