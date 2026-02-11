import BaseValidator from './base-validator.js';
import { body } from 'express-validator';

export default class DocumentUploadValidator extends BaseValidator {
	/**
	 * @param {string} fieldName
	 * @param {string} errorMessage
	 */
	constructor(fieldName, errorMessage = 'Upload an attachment') {
		super();
		this.fieldName = fieldName;
		this.errorMessage = errorMessage;
	}

	validate() {
		return [
			body(this.fieldName).custom((_, { req }) => {
				const decodedJson = Buffer.from(req.body?.[this.fieldName], 'base64').toString('utf-8');
				const parsed = JSON.parse(decodedJson);

				if (parsed.length === 0) {
					throw new Error(this.errorMessage);
				}
				return true;
			})
		];
	}
}
