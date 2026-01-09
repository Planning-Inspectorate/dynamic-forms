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
	constructor({
		options,
		errorMessage,
		fieldName
	}?: {
		options?: EmailValidationOptions | undefined;
		errorMessage?: string | undefined;
		fieldName?: string | undefined;
	});
	options: {
		/**
		 * - Allow display names (e.g., "John Doe <john@example.com>")
		 */
		allowDisplayName?: boolean | undefined;
		/**
		 * - Require top-level domain
		 */
		requireTld?: boolean | undefined;
		/**
		 * - Allow UTF8 characters in local part
		 */
		allowUtf8LocalPart?: boolean | undefined;
		/**
		 * - Allow IP addresses as domain
		 */
		allowIpDomain?: boolean | undefined;
		/**
		 * - Custom error message
		 */
		errorMessage?: string | undefined;
		allow_display_name: boolean;
		require_tld: boolean;
		allow_utf8_local_part: boolean;
		allow_ip_domain: boolean;
	};
	fieldName: string | undefined;
	validate(questionObj: any): import('express-validator').ValidationChain;
}
export type EmailValidationOptions = {
	/**
	 * - Allow display names (e.g., "John Doe <john@example.com>")
	 */
	allowDisplayName?: boolean | undefined;
	/**
	 * - Require top-level domain
	 */
	requireTld?: boolean | undefined;
	/**
	 * - Allow UTF8 characters in local part
	 */
	allowUtf8LocalPart?: boolean | undefined;
	/**
	 * - Allow IP addresses as domain
	 */
	allowIpDomain?: boolean | undefined;
	/**
	 * - Custom error message
	 */
	errorMessage?: string | undefined;
};
import BaseValidator from './base-validator.js';
