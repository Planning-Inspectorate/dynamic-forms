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
	constructor(params: any);
	/** @type {Array<Option>} */
	options: Array<Option>;
	optionJoinString: string;
	/**
	 * gets the view model for this question
	 * @param {import('../section.js').Section} section - the current section
	 * @param {import('../journey/journey.js').Journey} journey - the journey we are in
	 * @param {Record<string, unknown>} [customViewData] additional data to send to view
	 * @param {Record<string, unknown>} [payload]
	 * @param {import('#src/questions/question-types.d.ts').PrepQuestionForRenderingOptions} options
	 * @returns {QuestionViewModel}
	 */
	prepQuestionForRendering(
		section: import('../section.js').Section,
		journey: import('../journey/journey.js').Journey,
		customViewData?: Record<string, unknown>,
		payload?: Record<string, unknown>,
		options: any
	): QuestionViewModel;
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
export type OptionsViewModel = import('./question').QuestionViewModel & {
	question: {
		options: Option[];
	};
};
import { Question } from './question.js';
