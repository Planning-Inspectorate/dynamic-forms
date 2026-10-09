import { body } from 'express-validator';
import BaseValidator from './base-validator.ts';
import type { Question } from '../questions/question.ts';

/**
 * Universal validator to ensure the answer to the current question is not the same as another question's answer
 */
export class SameAnswerValidator extends BaseValidator {
	fieldNamesToCompare: string[];

	constructor(fieldNamesToCompare: string[], errorMessage?: string) {
		super();
		this.fieldNamesToCompare = fieldNamesToCompare || [];
		this.errorMessage = errorMessage || 'This answer cannot be the same as another answer';
	}

	/**
	 * validates the questionToCompare and compares it to the answer in the journeyResponse
	 */
	validate(questionObj: Question) {
		return body(questionObj.fieldName).custom((value, { req }) => {
			const answers = req?.res?.locals?.journeyResponse?.answers || {};
			if (this.fieldNamesToCompare.some((field) => value === answers[field])) {
				throw new Error(this.errorMessage);
			}
			return true;
		});
	}
}

export default SameAnswerValidator;
