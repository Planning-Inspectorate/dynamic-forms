import { body } from 'express-validator';
import DateValidator from './date-validator.js';

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
		timeInputLabel,
		dateInputLabel = timeInputLabel,
		dateValidationSettings = {
			ensureFuture: false,
			ensurePast: false
		},
		dateErrorMessages
	) {
		super(dateInputLabel, dateValidationSettings, dateErrorMessages);
		this.timeInputLabel = timeInputLabel;
	}

	/**
	 * validates the response body, checking the values sent for the date are valid
	 * @param {DateTimeQuestion} questionObj
	 */
	validate(questionObj) {
		const fieldName = questionObj.fieldName;
		const hourInput = `${fieldName}_hour`;
		const minuteInput = `${fieldName}_minutes`;
		const periodInput = `${fieldName}_period`;

		return [
			...super.validate(questionObj),
			body(hourInput)
				.notEmpty()
				.withMessage((_, { req }) => {
					if (!req.body[minuteInput] && req.body[periodInput] === '') {
						return `Enter the ${this.timeInputLabel.toLowerCase()} time`;
					}

					return `${this.timeInputLabel} time must include an hour`;
				}),
			body(hourInput).isInt({ min: 1, max: 12 }).withMessage(`${this.timeInputLabel} hour must be between 1 and 12.`),
			body(minuteInput)
				.notEmpty()
				.withMessage((_, { req }) => {
					if (req.body[hourInput] || req.body[periodInput] !== '') {
						return `${this.timeInputLabel} time must include a minute`;
					}
				}),
			body(minuteInput)
				.isInt({ min: 0, max: 59 })
				.withMessage(`${this.timeInputLabel} minute must be between 0 and 59.`),
			body(periodInput)
				.isIn(['am', 'pm'])
				.withMessage((_, { req }) => {
					if (req.body[hourInput] || req.body[minuteInput]) {
						return `${this.timeInputLabel} time must include am/pm`;
					}
				})
		];
	}
}
