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
	validate(): import('express-validator').ValidationChain;
}
export type Question = typeof import('../questions/question.js');
import BaseValidator from './base-validator.js';
