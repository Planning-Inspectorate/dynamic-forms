/**
 * @typedef {import('./question').QuestionViewModel} QuestionViewModel
 * @typedef {import('../journey/journey.js').Journey} Journey
 * @typedef {import('../journey/journey-response.js').JourneyResponse} JourneyResponse
 * @typedef {import('../section.js').Section} Section
 */
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
 * @typedef {QuestionViewModel & { question: { options: Option[] } }} OptionsViewModel
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
	 * @param {Section} section - the current section
	 * @param {Journey} journey - the journey we are in
	 * @param {Record<string, unknown>} [customViewData] additional data to send to view
	 * @param {Record<string, unknown>} [payload]
	 * @returns {QuestionViewModel}
	 */
	prepQuestionForRendering(
		section: Section,
		journey: Journey,
		customViewData?: Record<string, unknown>,
		payload?: Record<string, unknown>
	): QuestionViewModel;
}
export type QuestionViewModel = import('./question').QuestionViewModel;
export type Journey = import('../journey/journey.js').Journey;
export type JourneyResponse = import('../journey/journey-response.js').JourneyResponse;
export type Section = import('../section.js').Section;
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
export type OptionsViewModel = QuestionViewModel & {
	question: {
		options: Option[];
	};
};
import { Question } from './question.js';
