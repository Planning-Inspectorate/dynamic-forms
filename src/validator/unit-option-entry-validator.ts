import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';

import BaseValidator from './base-validator.ts';
import { toArray } from '#src/lib/utils.ts';
import type UnitOptionEntryQuestion from '#src/components/unit-option-entry/question.ts';
import type { Question } from '#src/questions/question.ts';

export interface UnitOptionEntryValidatorParams {
	errorMessage?: string;
	unit?: string;
	min?: number;
	max?: number;
	regex?: RegExp;
	regexMessage?: string;
}

/**
 * enforces a field is not empty when condition is satisfied
 * @class
 */
export class UnitOptionEntryValidator extends BaseValidator {
	errorMessage: string;
	unit: string;
	min: number | undefined;
	max: number | undefined;
	regex: RegExp | undefined;
	regexMessage: string;

	constructor({ errorMessage, unit, min, max, regex, regexMessage }: UnitOptionEntryValidatorParams = {}) {
		super();
		this.errorMessage = errorMessage || 'Enter a value';
		this.unit = unit || 'Input';
		this.min = min;
		this.max = max;
		this.regex = regex;
		this.regexMessage = regexMessage || 'Invalid input format';
	}

	/**
	 * validates the response body, checking the questionObj's fieldname
	 */
	validate(questionObj: UnitOptionEntryQuestion) {
		return questionObj.options.reduce((schema, option) => {
			schema.push(
				body(option.conditional.fieldName)
					.if(this.isValueIncluded(questionObj, option.value))
					.notEmpty()
					.withMessage(this.errorMessage)
			);

			if (this.regex) {
				schema.push(
					body(option.conditional.fieldName)
						.if(this.isValueIncluded(questionObj, option.value))
						.matches(new RegExp(this.regex))
						.withMessage(this.regexMessage)
				);
			}

			if (this.min !== undefined) {
				const minMessage = `${this.unit} must be at least ${this.min.toLocaleString()}`;

				schema.push(
					body(option.conditional.fieldName)
						.if(this.isValueIncluded(questionObj, option.value))
						.isFloat({ min: this.min })
						.withMessage(minMessage)
				);
			}

			if (this.max !== undefined) {
				const maxMessage = `${this.unit} must be ${this.max.toLocaleString()} or less`;

				schema.push(
					body(option.conditional.fieldName)
						.if(this.isValueIncluded(questionObj, option.value))
						.isFloat({ max: this.max })
						.withMessage(maxMessage)
				);
			}

			return schema;
		}, [] as ValidationChain[]);
	}

	isValueIncluded(questionObj: Question, value: unknown) {
		return body(questionObj.fieldName).custom((existingValues) => {
			existingValues = toArray(existingValues);
			return existingValues.includes(value);
		});
	}
}

export default UnitOptionEntryValidator;
