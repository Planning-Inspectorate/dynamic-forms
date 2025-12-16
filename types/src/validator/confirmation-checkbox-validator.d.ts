/**
 * @typedef {import('../questions/question.js')} Question
 */
/**
 * enforces a confirmation checkbox is checked before proceeding
 * @class
 */
export default class ConfirmationCheckboxValidator extends BaseValidator {
	/**
	 * creates an instance of a ConditionalRequiredValidator
	 * @param {Object} params
	 * @param {string} params.checkboxName
	 * @param {string} params.errorMessage - custom error message to show on validation failure
	 */
	constructor({ checkboxName, errorMessage }: { checkboxName: string; errorMessage: string });
	checkboxName: string;
	/**
	 * validates the response body, checking the checkbox name
	 */
	validate(): any;
}
import BaseValidator from './base-validator.js';
