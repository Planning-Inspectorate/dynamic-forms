import { body } from 'express-validator';
import BaseValidator from './base-validator.js';

/**
 * Universal validator to ensure the answer to the current question is not the same as another question's answer
 */
export default class SameAnswerValidator extends BaseValidator {
	/**
	 * @param {string[]} questionToCompare - field name to compare against
	 * @param {string} [errorMessage]
	 */

	constructor(questionToCompare, errorMessage) {
		super();
		this.questionToCompare = questionToCompare || [];
		this.errorMessage = errorMessage || 'This answer cannot be the same as another answer';
	}

	/**
	 * validates the questionToCompare and compares it to the answer in the journeyResponse
	 * @param questionObj
	 */
	validate(questionObj) {
		return body(questionObj.fieldName).custom((value, { req }) => {
			const answers = req?.res?.locals?.journeyResponse?.answers || {};
			if (this.questionToCompare.some((field) => value === answers[field])) {
				throw new Error(this.errorMessage);
			}
			return true;
		});
	}
}
