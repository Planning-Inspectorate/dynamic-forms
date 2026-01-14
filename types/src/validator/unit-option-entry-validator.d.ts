/**
 * @typedef {import('../questions/question.js')} Question
 */
/**
 * enforces a field is not empty when condition is satisfied
 * @class
 */
export default class UnitOptionEntryValidator extends BaseValidator {
	/**
	 * @param {Object} params
	 * @param {string} [params.errorMessage]
	 * @param {string} [params.unit]
	 * @param {number} [params.min]
	 * @param {number} [params.max]
	 * @param {Regex} [params.regex]
	 * @param {string} [params.regexMessage]
	 */
	constructor({
		errorMessage,
		unit,
		min,
		max,
		regex,
		regexMessage
	}?: {
		errorMessage?: string | undefined;
		unit?: string | undefined;
		min?: number | undefined;
		max?: number | undefined;
		regex?: any;
		regexMessage?: string | undefined;
	});
	unit: string;
	min: number | undefined;
	max: number | undefined;
	regex: any;
	regexMessage: string;
	/**
	 * validates the response body, checking the questionObj's fieldname
	 * @param {Question} questionObj
	 */
	validate(questionObj: Question): any;
	isValueIncluded(questionObj: any, value: any): import('express-validator').ValidationChain;
}
export type Question = typeof import('../questions/question.js');
import BaseValidator from './base-validator.js';
//# sourceMappingURL=unit-option-entry-validator.d.ts.map
