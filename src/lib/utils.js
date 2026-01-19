/**
 * replaces new line chars with a <br>
 * @param {string} [value]
 * @returns {string}
 */
export function nl2br(value) {
	if (!value) return '';

	return value.replace(/\r\n|\n/g, '<br>');
}

/**
 * @param {string|any} str
 * @returns {string}
 */
export function capitalize(str) {
	if (typeof str !== 'string') return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Trim a trailing slash if present
 *
 * @param {string} [str]
 * @returns {string}
 */
export function trimTrailingSlash(str) {
	if (typeof str !== 'string') return str;
	return str.replace(/\/$/, '');
}
