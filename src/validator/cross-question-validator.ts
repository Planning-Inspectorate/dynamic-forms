import BaseValidator from './base-validator.ts';
import { body } from 'express-validator';
import type { Question } from '#src/questions/question.ts';
import type { JourneyResponse } from '#src/journey/journey-response.ts';
import type { Request } from 'express';

export interface CrossQuestionValidatorParams {
	/**
	 * The field name of the other question to compare against.
	 */
	dependencyFieldName: string;
	/**
	 *  A function that takes the current question's answer and the other question's answer and returns true if valid, false otherwise.
	 */
	validationFunction: ((currentAnswer: unknown, dependencyAnswer: unknown) => boolean) | null;
	/**
	 * Whether to use req.body values for validation (default: false). Usually CrossQuestionValidator will be for validating across saved JourneyResponse answers, but if used between multiple fields on one question, it will need to use the body.
	 */
	useBodyValues?: boolean;
	/**
	 * Whether to use req.body values for the current question's answer (default: false). This may help with questions where data is not saved to the JourneyResponse on POST (e.g. non-multiple entities questions).
	 */
	useBodyValuesForCurrent?: boolean;
}

/**
 * Validator for validating a question's answer against another question's answer using a custom validation function.
 */
export class CrossQuestionValidator extends BaseValidator {
	dependencyFieldName: string;
	validationFunction: (currentAnswer: unknown, dependencyAnswer: unknown) => boolean;
	useBodyValues: boolean;
	useBodyValuesForCurrent: boolean;

	constructor(
		{
			dependencyFieldName,
			validationFunction,
			useBodyValues = false,
			useBodyValuesForCurrent = false
		}: CrossQuestionValidatorParams = {} as CrossQuestionValidatorParams
	) {
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
		this.useBodyValuesForCurrent = useBodyValues || useBodyValuesForCurrent;
	}

	/**
	 * Gets the body field name to bind validation to.
	 * Uses the question's bodyFieldNames getter to determine which body field
	 * express-validator binds to for triggering validation.
	 */
	#getBodyFieldName(questionObj: Question) {
		// Use the first body field name from the question's bodyFieldNames getter
		// This allows questions to define their own body field names, supporting
		// custom components and complex field structures (e.g. date, date-time, address)
		return questionObj.bodyFieldNames?.[0] ?? questionObj.fieldName;
	}

	/**
	 * Validates response body against individual field validators.
	 * Uses the question's getDataToSave method to extract and format body values when useBodyValuesForCurrent is true,
	 * allowing generic handling of any question type without needing to know its internal structure.
	 */
	validate(questionObj: Question, journeyResponse: JourneyResponse) {
		const fieldName = questionObj.fieldName;
		const bodyFieldName = this.#getBodyFieldName(questionObj);

		return [
			body(bodyFieldName).custom(async (value, { req }) => {
				const answers = journeyResponse?.answers || {};

				let currentAnswer;
				if (this.useBodyValuesForCurrent) {
					// Use the question's own getDataToSave to format body data generically
					if (typeof questionObj.getDataToSave === 'function') {
						const { answers: formattedAnswers } = await questionObj.getDataToSave(req as Request, journeyResponse);
						// Use the formatted answer if available, otherwise return all formatted answers
						// (handles MultiFieldInputQuestion which returns answers keyed by input field names)
						currentAnswer = fieldName in formattedAnswers ? formattedAnswers[fieldName] : formattedAnswers;
					} else {
						// Fallback to raw body value if getDataToSave is not available
						currentAnswer = req.body[fieldName];
					}
				} else {
					currentAnswer = answers[fieldName];
				}

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
