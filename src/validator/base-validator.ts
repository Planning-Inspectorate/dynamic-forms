import type { Question } from '#src/questions/question.ts';
import type { JourneyResponse } from '#src/journey/journey-response.ts';
import type { ValidationChain } from 'express-validator';

export abstract class BaseValidator {
	/**
	 * error message to display to user
	 */
	errorMessage: string | undefined;

	constructor() {
		if (this.constructor === BaseValidator) {
			throw new Error("Abstract classes can't be instantiated.");
		}
	}

	/**
	 * Validates response body against field validators.
	 * Subclasses must override this method.
	 * @abstract
	 */ // eslint-disable-next-line @typescript-eslint/no-unused-vars
	validate(questionObj: Question, journeyResponse?: JourneyResponse): ValidationChain | ValidationChain[] {
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
