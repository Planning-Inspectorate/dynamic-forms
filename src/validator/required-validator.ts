import { body } from 'express-validator';

import BaseValidator from './base-validator.ts';
import type { Question } from '../questions/question.ts';

/**
 * enforces a field is not empty
 * @class
 */
export class RequiredValidator extends BaseValidator {
	override errorMessage: string = 'You must select an answer';

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
	override validate(questionObj: Question) {
		return body(questionObj.fieldName).notEmpty().withMessage(this.errorMessage);
	}

	override isRequired() {
		return true;
	}
}

export default RequiredValidator;
