/**
 * @typedef {Object} Regex
 * @property {String | RegExp} regex
 * @property {String} regexMessage
 */
/**
 * @typedef {Object} MinLength
 * @property {Number} minLength
 * @property {String} minLengthMessage
 */
/**
 * @typedef {Object} MaxLength
 * @property {Number} maxLength
 * @property {String} maxLengthMessage
 */
/**
 * @typedef {Object} Field
 * @property {string} fieldName
 * @property {boolean} required
 * @property {string} errorMessage
 * @property {MinLength} [minLength]
 * @property {MaxLength} [maxLength]
 * @property {Regex} [regex]
 */
export default class MultiFieldInputValidator extends BaseValidator {
	/**
	 * @param {Object} params
	 * @param {Field[]} [params.fields]
	 * @param {string} [params.noInputsMessage]
	 */
	constructor({ fields, noInputsMessage }?: { fields?: Field[]; noInputsMessage?: string });
	fields: Field[];
	noInputsMessage: string;
	/**
	 * validates response body against question's required fields
	 */
	validate(): any[];
	isRequired(): any;
	/**
	 * checks if a field is required
	 * @param {string} fieldName
	 * @returns {boolean}
	 */
	inputFieldIsRequired(fieldName: string): boolean;
}
export type Regex = {
	regex: string | RegExp;
	regexMessage: string;
};
export type MinLength = {
	minLength: number;
	minLengthMessage: string;
};
export type MaxLength = {
	maxLength: number;
	maxLengthMessage: string;
};
export type Field = {
	fieldName: string;
	required: boolean;
	errorMessage: string;
	minLength?: MinLength;
	maxLength?: MaxLength;
	regex?: Regex;
};
import BaseValidator from './base-validator.js';
