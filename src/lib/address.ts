export interface IAddress {
	addressLine1?: string;
	addressLine2?: string;
	townCity?: string;
	county?: string;
	postcode?: string;
}

/**
 * Defines the shape of an address object
 * @class
 */
export class Address {
	/**
	 * the first line of the address
	 */
	addressLine1?: string;

	/**
	 * the second line of the address
	 */
	addressLine2?: string;

	/**
	 * the name of the town, city or other settlement
	 */
	townCity?: string;

	/**
	 * the name of the town, city or other settlement
	 */
	county?: string;

	/**
	 * the postcode
	 */
	postcode?: string;

	constructor({ addressLine1, addressLine2, townCity, county, postcode }: IAddress) {
		this.addressLine1 = addressLine1?.trim();
		this.addressLine2 = addressLine2?.trim();
		this.townCity = townCity?.trim();
		this.county = county?.trim();
		this.postcode = postcode?.trim();
	}
}
