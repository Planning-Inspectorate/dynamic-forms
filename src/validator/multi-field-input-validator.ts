import { body } from 'express-validator';

import BaseValidator from './base-validator.ts';
import type { MaxLength, MinLength, Regex } from './string-validator.ts';

export interface FieldBase {
	fieldName: string;
	minLength?: MinLength;
	maxLength?: MaxLength;
	regex?: Regex;
}

export interface RequiredField extends FieldBase {
	required: true;
	errorMessage: string;
}

export interface OptionalField extends FieldBase {
	required?: false;
	errorMessage?: string;
}

export type Field = RequiredField | OptionalField;

export class MultiFieldInputValidator extends BaseValidator {
	fields: Field[];
	noInputsMessage: string;

	constructor({ fields, noInputsMessage }: { fields?: Field[]; noInputsMessage?: string } = {}) {
		super();

		if (!fields) throw new Error('MultiFieldInput validator is invoked without any fields');
		this.fields = fields;
		this.noInputsMessage = noInputsMessage || 'Please complete the question';
	}

	/**
	 * validates response body against question's required fields
	 */

	validate() {
		// const requiredFieldNames = this.requiredFields.map((requiredField) => requiredField.fieldName);

		const rules = [];

		// results.push(body(requiredFieldNames).notEmpty().withMessage(this.noInputsMessage));

		for (const field of this.fields) {
			const { minLength, maxLength, regex, fieldName, required, errorMessage } = field;

			const fieldBody = body(fieldName);

			if (required) {
				rules.push(fieldBody.notEmpty().withMessage(errorMessage));
			}

			if (minLength) {
				rules.push(fieldBody.isLength({ min: minLength.minLength }).withMessage(minLength.minLengthMessage!));
			}

			if (maxLength) {
				rules.push(fieldBody.isLength({ max: maxLength.maxLength }).withMessage(maxLength.maxLengthMessage!));
			}

			if (regex) {
				rules.push(fieldBody.matches(new RegExp(regex.regex)).withMessage(regex.regexMessage!));
			}
		}

		return rules;
	}

	isRequired() {
		return Object.values(this.fields).some((field) => Boolean(field.required));
	}
	/**
	 * checks if a field is required
	 */
	inputFieldIsRequired(fieldName: string) {
		const field = this.fields.find((field) => field.fieldName === fieldName);
		if (!field) {
			throw new Error(`Field ${fieldName} not found`);
		}
		return field.required;
	}
}

export default MultiFieldInputValidator;
