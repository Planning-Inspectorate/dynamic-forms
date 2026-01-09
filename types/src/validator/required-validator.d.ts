/**
 * @typedef {import('../questions/question.js')} Question
 */
/**
 * enforces a field is not empty
 * @class
 */
export default class RequiredValidator extends BaseValidator {
	/**
	 * creates an instance of a RequiredValidator
	 * @param {string} [errorMessage] - custom error message to show on validation failure
	 */
	constructor(errorMessage?: string);
	/**
	 * validates the response body, checking the questionObj's fieldname
	 * @param {Question} questionObj
	 */
	validate(questionObj: Question): import('express-validator').ValidationChain;
}
export type Question = typeof import('../questions/question.js');
import BaseValidator from './base-validator.js';
