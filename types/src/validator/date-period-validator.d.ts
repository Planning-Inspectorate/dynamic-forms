/**
 * @typedef {import('../components/date/question.js')} DateQuestion
 */
/**
 * @typedef {Object} DateValidationSettings
 * @property {Boolean} ensureFuture
 * @property {Boolean} ensurePast
 */
import { DateQuestion } from './date-validator';

/**
 * enforces a user has entered a valid date period
 * @class
 */
export default class DatePeriodValidator extends BaseValidator {
	/**
	 * creates an instance of a DateValidator
	 * @param {string} inputLabel - string representing the field as displayed on the UI as part of an error message
	 * @param {DateValidationSettings} [dateValidationSettings] - object containing rules to apply
	 * @param {Object} [errorMessages] - object containing custom error messages to show on validation failure
	 */
	constructor(inputLabel: string, dateValidationSettings?: DateValidationSettings, errorMessages?: any);
	/** @type {DateValidationSettings} */
	dateValidationSettings: DateValidationSettings;
	emptyErrorMessage: any;
	noDayErrorMessage: any;
	noMonthErrorMessage: any;
	noYearErrorMessage: any;
	noDayMonthErrorMessage: any;
	noDayYearErrorMessage: any;
	noMonthYearErrorMessage: any;
	invalidDateErrorMessage: any;
	invalidMonthErrorMessage: any;
	invalidYearErrorMessage: any;
	futureDateErrorMessage: any;
	pastDateErrorMessage: any;
	/**
	 * validates the response body, checking the values sent for the date are valid
	 * @param {DateQuestion} questionObj
	 */
	validate(questionObj: DateQuestion): any[];
	rulesForNotEmptyInput({ dayInput, monthInput, yearInput }: { dayInput: any; monthInput: any; yearInput: any }): any[];
	rulesForValidInput({ dayInput, monthInput, yearInput }: { dayInput: any; monthInput: any; yearInput: any }): any[];
	rulesForDateIsInFuture({
		dayInput,
		monthInput,
		yearInput
	}: {
		dayInput: any;
		monthInput: any;
		yearInput: any;
	}): any[];
	#private;
}
export type DateValidationSettings = {
	ensureFuture: boolean;
	ensurePast: boolean;
};
import BaseValidator from './base-validator.js';
