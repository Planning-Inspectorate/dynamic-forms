export interface AddressAlternative {
	line1?: string | null;
	line2?: string | null;
	townCity?: string | null;
	county?: string | null;
	postcode?: string | null;
}

/**
 * @deprecated - not strictly dynamic-forms related, referenced by at least one project
 */
export function addressToViewModel(address: AddressAlternative) {
	const fields = [address.line1, address.line2, address.townCity, address.county, address.postcode];
	return fields.filter(Boolean).join(', ');
}
