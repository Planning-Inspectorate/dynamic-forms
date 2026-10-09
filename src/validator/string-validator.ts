import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';

import BaseValidator from './base-validator.ts';
import type { Question } from '../questions/question.ts';

export interface MinLength {
	minLength: number;
	minLengthMessage?: string;
}

export interface MaxLength {
	maxLength: number;
	maxLengthMessage?: string;
}

export interface Regex {
	regex: string | RegExp;
	regexMessage?: string;
}

export interface StringValidatorParams {
	minLength?: MinLength;
	maxLength?: MaxLength;
	regex?: Regex;
	fieldName?: string;
}

export class StringValidator extends BaseValidator {
	minLength: MinLength = {
		minLength: 0,
		minLengthMessage: ''
	};
	maxLength: MaxLength = {
		maxLength: 0,
		maxLengthMessage: ''
	};
	regex: Regex = {
		regex: '',
		regexMessage: ''
	};
	fieldName: string | undefined;

	constructor({ minLength, maxLength, regex, fieldName }: StringValidatorParams = {}) {
		super();

		if (!minLength && !maxLength && !regex) throw new Error('String validator is invoked without any validations set!');
		if (minLength && minLength.minLength) this.minLength = minLength;
		if (maxLength && maxLength.maxLength) this.maxLength = maxLength;
		if (regex && regex.regex) this.regex = regex;
		this.minLength.minLengthMessage = this.minLength.minLengthMessage
			? this.minLength.minLengthMessage
			: `Input too short - Please enter at least ${this.minLength.minLength} characters`;
		this.maxLength.maxLengthMessage = this.maxLength.maxLengthMessage
			? this.maxLength.maxLengthMessage
			: `Input too long - Please enter no more than ${this.maxLength.maxLength} characters`;
		this.regex.regexMessage = this.regex.regexMessage
			? this.regex.regexMessage
			: 'Please enter only the allowed characters';
		this.fieldName = fieldName;
	}

	validate(questionObj: Question) {
		const minLengthValidator = (chain: ValidationChain) =>
			chain.isLength({ min: this.minLength.minLength }).withMessage(this.minLength.minLengthMessage!);
		const maxLengthValidator = (chain: ValidationChain) =>
			chain.isLength({ max: this.maxLength.maxLength }).withMessage(this.maxLength.maxLengthMessage!);
		const regexValidator = (chain: ValidationChain) =>
			chain.matches(new RegExp(this.regex.regex)).withMessage(this.regex.regexMessage!);

		let chain = body(this.fieldName ? this.fieldName : questionObj.fieldName);
		if (this.minLength.minLength) {
			chain = minLengthValidator(chain);
		}
		if (this.maxLength.maxLength) {
			chain = maxLengthValidator(chain);
		}
		if (this.regex.regex) {
			chain = regexValidator(chain);
		}
		return chain;
	}
}

export default StringValidator;
