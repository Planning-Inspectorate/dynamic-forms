/**
 * @typedef {import('#question').QuestionViewModel} QuestionViewModel
 * @typedef {import('#journey').Journey} Journey
 * @typedef {import('#journey-response').JourneyResponse} JourneyResponse
 * @typedef {import('../../section').Section} Section
 * @typedef {import('../../validator/base-validator')} BaseValidator
 */
/**
 * @typedef {Object} Suffix
 * @property {string} text
 * @property {string} [classes] optional property, used to add classes to the suffix/prefix
 */
/**
 * @typedef {Object} InputField
 * @property {string} fieldName
 * @property {string} label
 * @property {string} [formatJoinString] optional property, used by formatAnswerForSummary (eg task list display), effective default to line break
 * @property {string} [formatPrefix] optional property, used by formatAnswerForSummary (eg task list display), to prefix answer
 * @property {function} [formatTextFunction] optional property, used to format the answer for display and value in question
 * @property {Record<string, string>} [attributes] optional property, used to add html attributes to the field
 * @property {Suffix} [suffix] optional property, used to add a suffix to the field
 * @property {Suffix} [prefix] optional property, used to add a prefix to the field
 */
/**
 * @class
 */
export default class MultiFieldInputQuestion extends Question {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
	 * @param {Record<string, string>} [params.inputAttributes] html attributes to add to the input
	 * @param {InputField[]} params.inputFields input fields
	 */
	constructor({ label, inputAttributes, inputFields, ...params }: import('#question-types').QuestionParameters);
	/** @type {Record<string, string>} */
	inputAttributes: Record<string, string>;
	label: any;
	inputFields: any;
	answerForViewModel(answers: any): any;
	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @param {Journey} journey
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
		journey: Journey
	): Array<{
		key: string;
		value: string | Object;
		action: {
			href: string;
			text: string;
			visuallyHiddenText: string;
		};
	}>;
	#private;
}
export type QuestionViewModel = import('#question').QuestionViewModel;
export type Journey = import('#journey').Journey;
export type JourneyResponse = import('#journey-response').JourneyResponse;
export type Section = any;
export type BaseValidator = any;
export type Suffix = {
	text: string;
	/**
	 * optional property, used to add classes to the suffix/prefix
	 */
	classes?: string | undefined;
};
export type InputField = {
	fieldName: string;
	label: string;
	/**
	 * optional property, used by formatAnswerForSummary (eg task list display), effective default to line break
	 */
	formatJoinString?: string | undefined;
	/**
	 * optional property, used by formatAnswerForSummary (eg task list display), to prefix answer
	 */
	formatPrefix?: string | undefined;
	/**
	 * optional property, used to format the answer for display and value in question
	 */
	formatTextFunction?: Function | undefined;
	/**
	 * optional property, used to add html attributes to the field
	 */
	attributes?: Record<string, string> | undefined;
	/**
	 * optional property, used to add a suffix to the field
	 */
	suffix?: Suffix | undefined;
	/**
	 * optional property, used to add a prefix to the field
	 */
	prefix?: Suffix | undefined;
};
import { Question } from '#question';
//# sourceMappingURL=question.d.ts.map
