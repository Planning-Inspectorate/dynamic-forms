/**
 * Defines the shape of an address object
 * @class
 */
export class Address {
    /**
     * creates an instance of an address
     * @param {Object} params
     * @param {string} params.addressLine1
     * @param {string} params.addressLine2
     * @param {string} params.townCity
     * @param {string} params.county
     * @param {string} params.postcode
     */
    constructor({ addressLine1, addressLine2, townCity, county, postcode }: {
        addressLine1: string;
        addressLine2: string;
        townCity: string;
        county: string;
        postcode: string;
    });
    /**
     * @type {string} - the first line of the address
     */
    addressLine1: string;
    /**
     * @type {string} - the second line of the address
     */
    addressLine2: string;
    /**
     * @type {string} - the name of the town, city or other settlement
     */
    townCity: string;
    /**
     * @type {string} - the name of the town, city or other settlement
     */
    county: string;
    /**
     * @type {string} - the postcode
     */
    postcode: string;
}
