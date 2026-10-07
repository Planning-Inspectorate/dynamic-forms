import { body } from 'express-validator';

import BaseValidator from './base-validator.ts';
import type { Question } from '#src/questions/question.ts';

export interface MinValue {
	min: number;
	minMessage: string;
}

export interface MaxValue {
	max: number;
	maxMessage: string;
}

export interface NumericValidatorParams {
	min?: number;
	minMessage?: string;
	max?: number;
	maxMessage?: string;
	regex?: RegExp;
	regexMessage?: string;
	fieldName?: string;
}

export class NumericValidator extends BaseValidator {
	min: number | undefined;
	minMessage: string;
	max: number | undefined;
	maxMessage: string;
	regex: RegExp | undefined;
	regexMessage: string;
	fieldName: string | undefined;

	constructor({ min, minMessage, max, maxMessage, regex, regexMessage, fieldName }: NumericValidatorParams = {}) {
		super();
		this.min = min;
		this.minMessage = minMessage || `The value must be at least ${min}`;
		this.max = max;
		this.maxMessage = maxMessage || `The value must not exceed ${max}`;
		this.regex = regex;
		this.regexMessage = regexMessage || 'Invalid input format';
		this.fieldName = fieldName;
	}

	validate(questionObj: Question) {
		let chain = body(this.fieldName ? this.fieldName : questionObj.fieldName);

		if (this.regex) {
			chain = chain.matches(new RegExp(this.regex)).withMessage(this.regexMessage);
		}

		if (this.min !== undefined) {
			chain = chain.isFloat({ min: this.min }).withMessage(this.minMessage);
		}

		if (this.max !== undefined) {
			chain = chain.isFloat({ max: this.max }).withMessage(this.maxMessage);
		}

		return chain;
	}
}

export default NumericValidator;
