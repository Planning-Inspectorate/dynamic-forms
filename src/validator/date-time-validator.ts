import { body } from 'express-validator';
import type { DateValidationSettings } from './date-validator.ts';
import DateValidator from './date-validator.ts';
import type DateTimeQuestion from '../components/date-time/question.ts';

/**
 * enforces a user has entered a valid date
 * @class
 */
export class DateTimeValidator extends DateValidator {
	timeInputLabel: string;

	constructor(
		timeInputLabel: string,
		dateInputLabel: string = timeInputLabel,
		dateValidationSettings: Omit<DateValidationSettings, 'optional'> = {
			ensureFuture: false,
			ensurePast: false
		},
		dateErrorMessages?: Record<string, string>
	) {
		super(dateInputLabel, dateValidationSettings, dateErrorMessages);
		this.timeInputLabel = timeInputLabel;
	}

	/**
	 * validates the response body, checking the values sent for the date are valid
	 */
	validate(questionObj: DateTimeQuestion) {
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

export default DateTimeValidator;
