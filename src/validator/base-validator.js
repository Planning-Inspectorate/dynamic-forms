/**
 * @abstract
 * @class BaseValidator
 */
export class BaseValidator {
	/**
	 * @type {string} error message to display to user
	 */
	errorMessage;

	constructor() {
		if (this.constructor === BaseValidator) {
			throw new Error("Abstract classes can't be instantiated.");
		}
	}

	/**
	 * Validates response body against field validators.
	 * Subclasses must override this method.
	 * @abstract
	 * @param {import('../questions/question-props.js').QuestionProps} questionObj - The question object containing the fieldName to validate.
	 * @param {import('../journey/journey-response.js').JourneyResponse} [journeyResponse] - The current journey response (optional).
	 * @returns {import('express-validator').ValidationChain | import('express-validator').ValidationChain[]}
	 */
	// eslint-disable-next-line no-unused-vars
	validate(questionObj, journeyResponse) {
		throw new Error('validate method must be implemented by subclass');
	}

	/**
	 * Should the question that this validator is configured with be treated as a required question?
	 *
	 * Validators should override this method as appropriate, implementing any custom required logic.
	 * For example, the AddressValidator is configurable and is required if any one field is required.
	 */
	isRequired() {
		return false;
	}
}

export default BaseValidator;
