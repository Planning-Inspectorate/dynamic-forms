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
 * @typedef {Object} Regex
 * @property {String | RegExp} regex
 * @property {String} regexMessage
 */
export default class StringValidator extends BaseValidator {
    /**
     * @param {Object} params
     * @param {MinLength} [params.minLength]
     * @param {MaxLength} [params.maxLength]
     * @param {Regex} [params.regex]
     * @param {string} [params.fieldName]
     */
    constructor({ minLength, maxLength, regex, fieldName }?: {
        minLength?: MinLength;
        maxLength?: MaxLength;
        regex?: Regex;
        fieldName?: string;
    });
    minLength: {
        minLength: number;
        minLengthMessage: string;
    };
    maxLength: {
        maxLength: number;
        maxLengthMessage: string;
    };
    regex: {
        regex: string;
        regexMessage: string;
    };
    fieldName: string;
    validate(questionObj: any): any;
}
export type MinLength = {
    minLength: number;
    minLengthMessage: string;
};
export type MaxLength = {
    maxLength: number;
    maxLengthMessage: string;
};
export type Regex = {
    regex: string | RegExp;
    regexMessage: string;
};
import BaseValidator from './base-validator.js';
