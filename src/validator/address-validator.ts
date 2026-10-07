import { body } from 'express-validator';

import BaseValidator from './base-validator.ts';
import type { Question } from '#src/questions/question.ts';

export const validatePostcode = (postcode: string, errorMessage = 'Enter a valid postcode') => {
	const pattern =
		/([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})/;
	const result = pattern.exec(postcode);
	if (!result) {
		throw new Error(errorMessage);
	}
	return postcode;
};

// todo: sort out config
export const addressLine1MaxLength = 250;
export const addressLine1MinLength = 0;
export const addressLine2MaxLength = 250;
export const addressLine2MinLength = 0;
export const townCityMaxLength = 250;
export const townCityMinLength = 0;
export const countyMaxLength = 250;
export const countyMinLength = 0;
export const postcodeMaxLength = 8;
export const postcodeMinLength = 5;

export interface AddressRequiredFields {
	addressLine1: boolean;
	addressLine2: boolean;
	townCity: boolean;
	county: boolean;
	postcode: boolean;
}

export interface AddressValidatorParams {
	requiredFields?: AddressRequiredFields;
}

/**
 * enforces address fields are within allowed parameters
 * @class
 */
export class AddressValidator extends BaseValidator {
	requiredFields: AddressRequiredFields | undefined;

	/**
	 * creates an instance of an AddressValidator
	 */
	constructor(opts?: AddressValidatorParams) {
		super();
		this.requiredFields = opts?.requiredFields;
	}

	/**
	 * validates response body using questionObj fieldname
	 */
	validate(questionObj: Question) {
		const fieldName = questionObj.fieldName;

		return [
			this.#addressLine1Rule(fieldName),
			this.#addressLine2Rule(fieldName),
			this.#townCityRule(fieldName),
			this.#countyRule(fieldName),
			this.#postCodeRule(fieldName)
		];
	}

	/**
	 * a validation chain for addressLine1
	 */
	#addressLine1Rule(fieldName: string) {
		const validator = body(fieldName + '_addressLine1');

		if (!this.requiredFields?.addressLine1) {
			validator.optional({ checkFalsy: true });
		} else {
			validator.notEmpty().withMessage(`Enter address line 1, typically the building and street`);
		}

		return validator
			.isLength({ min: addressLine1MinLength, max: addressLine1MaxLength })
			.bail()
			.withMessage(`Address line 1 must be ${addressLine1MaxLength} characters or less`);
	}

	/**
	 * a validation chain for addressLine2
	 */
	#addressLine2Rule(fieldName: string) {
		const validator = body(fieldName + '_addressLine2');
		if (!this.requiredFields?.addressLine2) {
			validator.optional({ checkFalsy: true });
		} else {
			validator.notEmpty().withMessage(`Enter an address line 2`);
		}

		return validator
			.isLength({ min: addressLine2MinLength, max: addressLine2MaxLength })
			.bail()
			.withMessage(`Address line 2 must be ${addressLine2MaxLength} characters or less`);
	}

	/**
	 * a validation chain for townCity
	 */
	#townCityRule(fieldName: string) {
		const validator = body(fieldName + '_townCity');
		if (!this.requiredFields?.townCity) {
			validator.optional({ checkFalsy: true });
		} else {
			validator.notEmpty().withMessage(`Enter a town or city`);
		}
		return validator
			.isLength({ min: townCityMinLength, max: townCityMaxLength })
			.bail()
			.withMessage(`Town or city must be ${townCityMaxLength} characters or less`);
	}

	/**
	 * a validation chain for county
	 */
	#countyRule(fieldName: string) {
		const validator = body(fieldName + '_county');
		if (!this.requiredFields?.county) {
			validator.optional({ checkFalsy: true });
		} else {
			validator.notEmpty().withMessage(`Enter a county`);
		}

		return validator
			.isLength({ min: countyMinLength, max: countyMaxLength })
			.bail()
			.withMessage(`County must be ${countyMaxLength} characters or less`);
	}

	/**
	 * a validation chain for postcode
	 */
	#postCodeRule(fieldName: string) {
		const validator = body(fieldName + '_postcode');
		if (!this.requiredFields?.postcode) {
			validator.optional({ checkFalsy: true });
		} else {
			validator.notEmpty().withMessage(`Enter a postcode`);
		}

		return validator
			.isLength({ min: postcodeMinLength, max: postcodeMaxLength })
			.bail()
			.withMessage(`Postcode must be between ${postcodeMinLength} and ${postcodeMaxLength} characters`)
			.custom((postcode) => {
				return validatePostcode(postcode);
			});
	}

	isRequired() {
		if (this.requiredFields) {
			return Object.values(this.requiredFields).some((field) => Boolean(field));
		}
		return false;
	}
}

export default AddressValidator;
