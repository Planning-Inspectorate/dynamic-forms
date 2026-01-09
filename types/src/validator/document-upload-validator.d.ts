export default class DocumentUploadValidator extends BaseValidator {
	/**
	 * @param {string} fieldName
	 */
	constructor(fieldName: string);
	fieldName: string;
	validate(): import('express-validator').ValidationChain[];
}
import BaseValidator from './base-validator.js';
