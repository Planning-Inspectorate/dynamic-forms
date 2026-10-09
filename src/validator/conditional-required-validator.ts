import type { ValidationChain } from 'express-validator';
import { body } from 'express-validator';
import BaseValidator from './base-validator.ts';
import { toArray } from '../lib/utils.ts';
import type OptionsQuestion from '../questions/options-question.ts';
import { optionIsSelectable } from '../questions/options-question.ts';
import type { Question } from '../questions/question.ts';
import type { SelectableOption } from '../types/question-props.ts';

/**
 * enforces a field is not empty when condition is satisfied
 * @class
 */
export class ConditionalRequiredValidator extends BaseValidator {
	errorMessage: string = 'Provide further information';

	/**
	 * creates an instance of a ConditionalRequiredValidator
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
	validate(questionObj: OptionsQuestion) {
		return questionObj.options.filter(optionIsSelectable).reduce((schema, option) => {
			if (option.conditional) {
				schema.push(
					body(this.getConditionalFieldName(questionObj, option))
						.if(this.isValueIncluded(questionObj, option.value))
						.notEmpty()
						.withMessage(this.errorMessage)
				);
			}
			return schema;
		}, [] as ValidationChain[]);
	}

	getConditionalFieldName(questionObj: Question, option: SelectableOption) {
		return `${questionObj.fieldName}_${option.conditional?.fieldName}`;
	}

	isValueIncluded(questionObj: Question, value: unknown) {
		return body(questionObj.fieldName).custom((existingValues) => {
			existingValues = toArray(existingValues);
			return existingValues.includes(value);
		});
	}
}

export default ConditionalRequiredValidator;
