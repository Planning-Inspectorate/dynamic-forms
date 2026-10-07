import { body } from 'express-validator';

import BaseValidator from './base-validator.ts';
import type { Question } from '#src/questions/question.ts';

/**
 * enforces a field is not empty
 * @class
 */
export class RequiredValidator extends BaseValidator {
	errorMessage: string = 'You must select an answer';

	/**
	 * creates an instance of a RequiredValidator
	 */
	constructor(errorMessage?: string) {
		super();

		if (errorMessage) {
			this.errorMessage = errorMessage;
		}
	}

	/**
	 * validates the response body, checking the questionObj's fieldname
	 */
	validate(questionObj: Question) {
		return body(questionObj.fieldName).notEmpty().withMessage(this.errorMessage);
	}

	isRequired() {
		return true;
	}
}

export default RequiredValidator;
