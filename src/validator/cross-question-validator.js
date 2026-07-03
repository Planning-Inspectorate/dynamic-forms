import BaseValidator from './base-validator.js';
import { body } from 'express-validator';

/**
 * Validator for validating a question's answer against another question's answer using a custom validation function.
 */
export class CrossQuestionValidator extends BaseValidator {
	/** @type {string} */
	dependencyFieldName;
	/** @type {((currentAnswer: unknown, dependencyAnswer: unknown) => boolean)} */
	validationFunction;
	/** @type {boolean} */
	useBodyValues;

	/**
	 * @param {Object} params
	 * @param {string} params.dependencyFieldName - The field name of the other question to compare against.
	 * @param {((currentAnswer: unknown, dependencyAnswer: unknown) => boolean)| null} params.validationFunction - A function that takes the current question's answer and the other question's answer and returns true if valid, false otherwise.
	 * @param {boolean} [params.useBodyValues=false] - Whether to use req.body values for validation (default: false). Usually CrossQuestionValidator will be for validating across saved session answers, but if used between multiple fields on one question, it will need to use the body.
	 * @throws {Error} If validationFunction is not provided or is not a function.
	 * @throws {Error} If dependencyFieldName is not provided
	 */
	constructor({ dependencyFieldName, validationFunction, useBodyValues = false } = {}) {
		super();

		if (!dependencyFieldName) {
			throw new Error('CrossQuestionValidator requires dependencyFieldName');
		}
		if (!validationFunction || typeof validationFunction !== 'function') {
			throw new Error('CrossQuestionValidator requires a validationFunction');
		}

		this.dependencyFieldName = dependencyFieldName;
		this.validationFunction = validationFunction;
		this.useBodyValues = useBodyValues;
	}

	/**
	 * Validates response body against individual field validators.
	 * @param {import('../questions/question.js').Question} questionObj - The question object containing the fieldName to validate.
	 * @param {import('../journey/journey-response.js').JourneyResponse} [journeyResponse={}] - The current journey response, used to access saved answers for validation.
	 * @returns {import('express-validator').ValidationChain[]}
	 */
	validate(questionObj, journeyResponse = {}) {
		const fieldName = questionObj.fieldName;

		return [
			body(fieldName).custom((value, { req }) => {
				const answers = journeyResponse?.answers || {};
				const currentAnswer = this.useBodyValues ? value : answers[fieldName];
				const dependencyAnswer = this.useBodyValues
					? req.body[this.dependencyFieldName]
					: answers[this.dependencyFieldName];
				return (
					this.validationFunction(currentAnswer, dependencyAnswer) ||
					// Fallback if validation fails without throwing an error
					Promise.reject(
						new Error(`Cross-question validation failed between ${fieldName} and ${this.dependencyFieldName}`)
					)
				);
			})
		];
	}
}

export default CrossQuestionValidator;
