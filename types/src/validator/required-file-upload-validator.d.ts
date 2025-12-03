/**
 * @typedef {import('../questions/question.js')} Question
 */
/**
 * enforces that at least one file is present for a question, whether it is being/already uploaded
 * @class
 */
export default class RequiredFileUploadValidator extends BaseValidator {
    /**
     * creates an instance of a RequiredFileUploadValidator
     * @param {string} [errorMessage] - custom error message to show on validation failure
     */
    constructor(errorMessage?: string);
    /**
     * validates against path based on questionObj's fieldname
     * @param {Question} questionObj
     */
    validate(questionObj: Question, journeyResponse: any): any;
}
export type Question = typeof import("../questions/question.js");
import BaseValidator from './base-validator.js';
