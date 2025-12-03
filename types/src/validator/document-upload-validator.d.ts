export default class DocumentUploadValidator extends BaseValidator {
    /**
     * @param {string} fieldName
     */
    constructor(fieldName: string);
    fieldName: string;
    validate(): any[];
}
import BaseValidator from './base-validator.js';
