/**
 * @typedef {{
 *   text: string;
 *   value: string;
 *     hint?: object;
 *   checked?: boolean | undefined;
 *   attributes?: Record<string, string>;
 *   behaviour?: 'exclusive';
 *   conditional?: {
 *     question: string;
 *     type: string;
 *     fieldName: string;
 *         inputClasses?: string;
 *         html?: string;
 *     value?: unknown;
 *         label?: string;
 *         hint?: string
 *   };
 *     conditionalText?: {
 *       html: string;
 *   }
 *}} Option
 */
/**
 * @typedef {import('./question').QuestionViewModel & { question: { options: Option[] } }} OptionsViewModel
 */
export default class OptionsQuestion extends Question {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {Array<Option>} params.options
	 */
	constructor(params: import('#question-types').QuestionParameters);
	/** @type {Array<Option>} */
	options: Array<Option>;
	optionJoinString: string;
	/**
	 * gets the view model for this question
	 * @param {import('#section').Section} section - the current section
	 * @param {import('#journey').Journey} journey - the journey we are in
	 * @param {Record<string, unknown>} [customViewData] additional data to send to view
	 * @param {Record<string, unknown>} [payload]
	 * @param {import('#src/questions/question-types.d.ts').PrepQuestionForRenderingOptions} options
	 * @returns {import('./question').QuestionViewModel} QuestionViewModel
	 */
	prepQuestionForRendering(
		section: import('#section').Section,
		journey: import('#journey').Journey,
		customViewData?: Record<string, unknown>,
		payload?: Record<string, unknown>,
		options: import('#src/questions/question-types.d.ts').PrepQuestionForRenderingOptions
	): any;
}
export type Option = {
	text: string;
	value: string;
	hint?: object;
	checked?: boolean | undefined;
	attributes?: Record<string, string>;
	behaviour?: 'exclusive';
	conditional?: {
		question: string;
		type: string;
		fieldName: string;
		inputClasses?: string;
		html?: string;
		value?: unknown;
		label?: string;
		hint?: string;
	};
	conditionalText?: {
		html: string;
	};
};
export type OptionsViewModel = any & {
	question: {
		options: Option[];
	};
};
import { Question } from './question.js';
//# sourceMappingURL=options-question.d.ts.map
