import { body } from 'express-validator';
import BaseValidator from './base-validator.ts';
import type { Question } from '#question';
import type { IsEmailOptions } from 'express-validator/lib/options.d.ts';

/**
 * Accepts any IsEmail options, but also redefines some common ones as camelCase, with defaults
 */
export interface EmailValidationOptions extends IsEmailOptions {
	/**
	 * Allow display names (e.g., "John Doe <john@example.com>")
	 * @default false
	 */
	allowDisplayName?: boolean;
	/**
	 * Require top-level domain
	 * @default true
	 */
	requireTld?: boolean;
	/**
	 * Allow UTF8 characters in local part
	 * @default true
	 */
	allowUtf8LocalPart?: boolean;
	/**
	 * Allow IP addresses as domain
	 * @default false
	 */
	allowIpDomain?: boolean;
}

export class EmailValidator extends BaseValidator {
	options: IsEmailOptions;

	fieldName: string | undefined;
	errorMessage: string;

	constructor({
		options = {},
		errorMessage,
		fieldName
	}: {
		options?: EmailValidationOptions;
		errorMessage?: string;
		fieldName?: string;
	} = {}) {
		super();

		// snake_case to match the express-validator options for isEmail
		// https://express-validator.github.io/docs/api/validation-chain#isemail
		/* eslint-disable camelcase */
		this.options = {
			allow_display_name: options.allowDisplayName || false,
			require_tld: options.requireTld !== false, // Default to true
			allow_utf8_local_part: options.allowUtf8LocalPart !== undefined ? options.allowUtf8LocalPart : true,
			allow_ip_domain: options.allowIpDomain || false,
			...options
		};
		/* eslint-enable camelcase */

		this.errorMessage = errorMessage || 'Enter an email address in the correct format, like name@example.com';
		this.fieldName = fieldName;
	}

	validate(questionObj: Question) {
		const fieldName = this.fieldName || questionObj.fieldName;

		return body(fieldName).isEmail(this.options).withMessage(this.errorMessage);
	}
}

export default EmailValidator;
