/**
 * Universal validator to ensure the answer to the current question is not the same as another question's answer
 */
export default class SameAnswerValidator extends BaseValidator {
	/**
	 * @param {string[]} fieldNamesToCompare - field name to compare against
	 * @param {string} [errorMessage]
	 */
	constructor(fieldNamesToCompare: string[], errorMessage?: string);
	fieldNamesToCompare: string[];
	/**
	 * validates the questionToCompare and compares it to the answer in the journeyResponse
	 * @param questionObj
	 */
	validate(questionObj: any): import('express-validator').ValidationChain;
}
import BaseValidator from './base-validator.js';
