import { body } from 'express-validator';
import BaseValidator from './base-validator.ts';

/**
 * enforces a confirmation checkbox is checked before proceeding
 * @class
 */
export class ConfirmationCheckboxValidator extends BaseValidator {
	errorMessage: string;
	checkboxName: string;

	/**
	 * creates an instance of a ConfirmationCheckboxValidator
	 * @param params
	 * @param params.checkboxName
	 * @param params.errorMessage - custom error message to show on validation failure
	 */
	constructor({ checkboxName, errorMessage }: { checkboxName: string; errorMessage?: string }) {
		super();

		this.checkboxName = checkboxName;
		this.errorMessage = errorMessage || 'Please check the checkbox';
	}

	/**
	 * validates the response body, checking the checkbox name
	 */
	validate() {
		return body(this.checkboxName).notEmpty().withMessage(this.errorMessage);
	}
}

export default ConfirmationCheckboxValidator;
