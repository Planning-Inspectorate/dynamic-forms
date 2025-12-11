export const requiredCoordinateLength: 6;
/**
 * @typedef {Object} CoordinateField
 * @property {string} title
 * @property {string} fieldName
 */
export default class CoordinatesValidator extends BaseValidator {
	/**
	 * @param {CoordinateField} northing
	 * @param {CoordinateField} easting
	 */
	constructor(northing: CoordinateField, easting: CoordinateField);
	northing: CoordinateField;
	easting: CoordinateField;
	validate(): any[];
}
export type CoordinateField = {
	title: string;
	fieldName: string;
};
import BaseValidator from './base-validator.js';
