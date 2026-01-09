/**
 * @typedef {import('./question.js')} DateTimeQuestion
 */
/**
 * enforces a user has entered a valid date
 * @class
 */
export default class DateTimeValidator extends DateValidator {
	/**
	 * creates an instance of a DateTimeValidator
	 * @param {string} timeInputLabel - string representing the time fields as displayed on the UI as part of an error message
	 * @param {string} [dateInputLabel] - string representing the date fields as displayed on the UI as part of an error message
	 * @param {DateValidationSettings} [dateValidationSettings] - object containing rules to apply
	 * @param {Object} [dateErrorMessages] - object containing custom date error messages to show on validation failure
	 */
	constructor(
		timeInputLabel: string,
		dateInputLabel?: string,
		dateValidationSettings?: DateValidationSettings,
		dateErrorMessages?: any
	);
	timeInputLabel: string;
	/**
	 * validates the response body, checking the values sent for the date are valid
	 * @param {DateTimeQuestion} questionObj
	 */
	validate(questionObj: DateTimeQuestion): import('express-validator').ValidationChain[];
}
export type DateTimeQuestion = any;
import DateValidator from './date-validator.js';
