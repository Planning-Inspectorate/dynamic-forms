/**
 * @typedef {Object} MinValue
 * @property {Number} min
 * @property {String} minMessage
 */
/**
 * @typedef {Object} MaxValue
 * @property {Number} max
 * @property {String} maxMessage
 */
export default class NumericValidator extends BaseValidator {
	/**
	 * @param {Object} params
	 * @param {number} [params.min]
	 * @param {string} [params.minMessage]
	 * @param {number} [params.max]
	 * @param {string} [params.maxMessage]
	 * @param {RegExp} [params.regex]
	 * @param {string} [params.regexMessage]
	 * @param {string} [params.fieldName]
	 */
	constructor({
		min,
		minMessage,
		max,
		maxMessage,
		regex,
		regexMessage,
		fieldName
	}?: {
		min?: number;
		minMessage?: string;
		max?: number;
		maxMessage?: string;
		regex?: RegExp;
		regexMessage?: string;
		fieldName?: string;
	});
	min: number;
	minMessage: string;
	max: number;
	maxMessage: string;
	regex: RegExp;
	regexMessage: string;
	fieldName: string;
	validate(questionObj: any): import('express-validator').ValidationChain;
}
export type MinValue = {
	min: number;
	minMessage: string;
};
export type MaxValue = {
	max: number;
	maxMessage: string;
};
import BaseValidator from './base-validator.js';
