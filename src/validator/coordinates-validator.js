import BaseValidator from './base-validator.js';
import { body } from 'express-validator';

export const requiredCoordinateLength = 6;

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
	constructor(northing, easting) {
		super();
		this.northing = northing;
		this.easting = easting;
	}

	validate() {
		return [
			body(this.northing.fieldName)
				.optional({ checkFalsy: true })
				.isNumeric()
				.withMessage(`The ${this.northing.title} grid reference must be a number`)
				.isLength({ min: requiredCoordinateLength, max: requiredCoordinateLength })
				.withMessage(`The ${this.northing.title} grid reference must contain ${requiredCoordinateLength} digits`),

			body(this.easting.fieldName)
				.optional({ checkFalsy: true })
				.isNumeric()
				.withMessage(`The ${this.easting.title} grid reference must be a number`)
				.isLength({ min: requiredCoordinateLength, max: requiredCoordinateLength })
				.withMessage(`The ${this.easting.title} grid reference must contain ${requiredCoordinateLength} digits`),

			// validate northing has been populated if value for easting provided
			body(this.northing.fieldName).custom((_, { req }) => {
				const { siteNorthing, siteEasting } = req.body;
				if (!siteNorthing && siteEasting) {
					throw new Error(`The ${this.northing.title} grid reference must contain 6 digits`);
				}
				return true;
			}),

			// validate easting has been populated if value for northing provided
			body(this.easting.fieldName).custom((_, { req }) => {
				const { siteNorthing, siteEasting } = req.body;
				if (siteNorthing && !siteEasting) {
					throw new Error(`The ${this.easting.title} grid reference must contain 6 digits`);
				}
				return true;
			})
		];
	}
}
