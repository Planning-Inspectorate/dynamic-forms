import { body } from 'express-validator';

import BaseValidator from './base-validator.ts';
import { toArray } from '#src/lib/utils.ts';
import type OptionsQuestion from '#src/questions/options-question.ts';
import { optionIsSelectable } from '#src/questions/options-question.ts';

/**
 * enforces a field is within the question's predefined list of options
 * @class
 */
export class ValidOptionValidator extends BaseValidator {
	errorMessage: string;
	/**
	 * creates an instance of a ValidOptionValidator
	 */
	constructor(errorMessage?: string) {
		super();

		if (errorMessage) {
			this.errorMessage = errorMessage;
		} else {
			this.errorMessage = 'You must select a valid answer';
		}
	}

	/**
	 * validates the response body, checking the value sent for the questionObj's fieldname is within the predefined list of options
	 */
	validate(questionObj: OptionsQuestion) {
		return body(questionObj.fieldName)
			.custom((value) => {
				if (!value) return true;
				value = toArray(value);
				const optionValues = questionObj.options.filter(optionIsSelectable).map((option) => option.value);
				return value.every((element: string) => optionValues.includes(element));
			})
			.withMessage(this.errorMessage);
	}
}

export default ValidOptionValidator;
