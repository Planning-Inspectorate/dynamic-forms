/**
 * @typedef {import('../questions/options-question.js')} OptionsQuestion
 */
import OptionsQuestion from '../questions/options-question';

/**
 * enforces a field is within the question's predefined list of options
 * @class
 */
export default class ValidOptionValidator extends BaseValidator {
	/**
	 * creates an instance of a RequiredValidator
	 * @param {string} [errorMessage] - custom error message to show on validation failure
	 */
	constructor(errorMessage?: string);
	/**
	 * validates the response body, checking the value sent for the questionObj's fieldname is within the predefined list of options
	 * @param {OptionsQuestion} questionObj
	 */
	validate(questionObj: OptionsQuestion): any;
}
import BaseValidator from './base-validator.js';
