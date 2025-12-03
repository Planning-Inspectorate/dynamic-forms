export function validatePostcode(postcode: any, errorMessage?: string): any;
export const addressLine1MaxLength: 250;
export const addressLine1MinLength: 0;
export const addressLine2MaxLength: 250;
export const addressLine2MinLength: 0;
export const townCityMaxLength: 250;
export const townCityMinLength: 0;
export const countyMaxLength: 250;
export const countyMinLength: 0;
export const postcodeMaxLength: 8;
export const postcodeMinLength: 5;
/**
 * enforces address fields are within allowed parameters
 * @class
 */
export default class AddressValidator extends BaseValidator {
    /**
     * creates an instance of an AddressValidator
     * @param {Object} opts
     * @param {boolean} [opts.required]
     * @param {{[key: string]: boolean}} [opts.requiredFields]
     */
    constructor(opts: {
        required?: boolean;
        requiredFields?: {
            [key: string]: boolean;
        };
    });
    requiredFields: {
        [key: string]: boolean;
    };
    /**
     * validates response body using questionObj fieldname
     * @param {Question} questionObj
     */
    validate(questionObj: Question): any[];
    isRequired(): any;
    #private;
}
import BaseValidator from './base-validator.js';
