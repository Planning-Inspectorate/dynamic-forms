/**
 * replaces new line chars with a <br>
 */
export function nl2br(value?: string) {
	if (!value) return '';

	return value.replace(/\r\n|\n/g, '<br>');
}

export function capitalize(str: string | any) {
	if (typeof str !== 'string') return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Trim a trailing slash if present
 */
export function trimTrailingSlash(str?: string) {
	if (typeof str !== 'string') return str;
	return str.replace(/\/$/, '');
}

/**
 * Convert a value to an array, unless it is already
 */
export function toArray<T>(value: T | T[]) {
	return Array.isArray(value) ? value : [value];
}
