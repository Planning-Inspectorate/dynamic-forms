export interface AddressAlternative {
	line1?: string;
	line2?: string;
	townCity?: string;
	county?: string;
	postcode?: string;
}

/**
 * @deprecated - not strictly dynamic-forms related, referenced by at least one project
 */
export function addressToViewModel(address: AddressAlternative) {
	const fields = [address.line1, address.line2, address.townCity, address.county, address.postcode];
	return fields.filter(Boolean).join(', ');
}
