import { body } from 'express-validator';

import BaseValidator from './base-validator.js';

/**
 * @typedef {Object} EmailValidationOptions
 * @property {boolean} [allowDisplayName] - Allow display names (e.g., "John Doe <john@example.com>")
 * @property {boolean} [requireTld] - Require top-level domain
 * @property {boolean} [allowUtf8LocalPart] - Allow UTF8 characters in local part
 * @property {boolean} [allowIpDomain] - Allow IP addresses as domain
 * @property {string} [errorMessage] - Custom error message
 */

export default class EmailValidator extends BaseValidator {
	/**
	 * @param {Object} params
	 * @param {EmailValidationOptions} [params.options] - Email validation options
	 * @param {string} [params.errorMessage] - Custom error message
	 * @param {string} [params.fieldName] - Field name to validate
	 */
	constructor({ options = {}, errorMessage, fieldName } = {}) {
		super();

		this.options = {
			allow_display_name: options.allowDisplayName || false,
			require_tld: options.requireTld !== false, // Default to true
			allow_utf8_local_part: options.allowUtf8LocalPart !== undefined ? options.allowUtf8LocalPart : true,
			allow_ip_domain: options.allowIpDomain || false,
			...options
		};

		this.errorMessage = errorMessage || 'Enter an email address in the correct format, like name@example.com';
		this.fieldName = fieldName;
	}

	validate(questionObj) {
		const fieldName = this.fieldName || questionObj.fieldName;

		return body(fieldName).isEmail(this.options).withMessage(this.errorMessage);
	}
}
