/**
 * @typedef {import('#question').QuestionViewModel} QuestionViewModel
 * @typedef {import('#journey').Journey} Journey
 * @typedef {import('#journey-response').JourneyResponse} JourneyResponse
 * @typedef {import('../../section').Section} Section
 * @typedef {import('../../validator/base-validator')} BaseValidator
 */
/**
 * Email input question that extends SingleLineInputQuestion
 * Automatically sets the input type to "email" and adds appropriate attributes
 * @class
 */
export default class EmailQuestion extends SingleLineInputQuestion {
	/**
	 * Override formatAnswerForSummary to prevent capitalization of email addresses
	 * Email addresses should remain in their original case (typically lowercase)
	 * @param {string} sectionSegment
	 * @param {import('#journey').Journey} journey
	 * @param {string} answer
	 * @returns {Array}
	 */
	formatAnswerForSummary(sectionSegment: string, journey: import('#journey').Journey, answer: string): any[];
}
export type QuestionViewModel = import('#question').QuestionViewModel;
export type Journey = import('#journey').Journey;
export type JourneyResponse = import('#journey-response').JourneyResponse;
export type Section = any;
export type BaseValidator = any;
import SingleLineInputQuestion from '../single-line-input/question.js';
//# sourceMappingURL=question.d.ts.map
