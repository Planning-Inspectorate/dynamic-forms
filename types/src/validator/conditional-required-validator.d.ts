/**
 * @typedef {import('../questions/question.js')} Question
 */
/**
 * enforces a field is not empty when condition is satisfied
 * @class
 */
export default class ConditionalRequiredValidator extends BaseValidator {
	/**
	 * creates an instance of a ConditionalRequiredValidator
	 * @param {string} [errorMessage] - custom error message to show on validation failure
	 */
	constructor(errorMessage?: string);
	/**
	 * validates the response body, checking the questionObj's fieldname
	 * @param {Question} questionObj
	 */
	validate(questionObj: Question): any;
	getConditionalFieldName(questionObj: any, option: any): string;
	isValueIncluded(questionObj: any, value: any): any;
}
type Question = typeof import('../questions/question.js');
import BaseValidator from './base-validator.js';
