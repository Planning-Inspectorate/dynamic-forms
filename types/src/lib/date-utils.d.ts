/**
 * Display the date in Europe/London
 * @param {Date|string} [date]
 * @param {Object} [options]
 * @param {string} [options.format] date formatting string
 * @returns {string} formatted date string or empty string if invalid value passed in
 */
export function formatDateForDisplay(
	date?: Date | string,
	{
		format
	}?: {
		format?: string;
	}
): string;
/**
 * @typedef {Object} DateTimeParams
 * @property {number} year
 * @property {number} month
 * @property {number} day
 * @property {number} [hour]
 * @property {number} [minute]
 * @property {number} [second]
 * @property {boolean} [convertToUTC]
 */
/**
 * Parse the date and time parameters provided by a user
 * @param {DateTimeParams} params
 * @returns {Date}
 */
export function parseDateInput({ year, month, day, hour, minute, second }: DateTimeParams): Date;
/**
 * Start of the day in UK time zone
 */
export function startOfDay(): Date;
/**
 * End of the day in UK time zone
 */
export function endOfDay(): Date;
/**
 * Check if today is within the date range inclusive (start <= now <= end)
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {boolean}
 */
export function nowIsWithinRange(startDate: Date, endDate: Date): boolean;
/**
 * Check if today is on or after the start date
 * @param {Date} startDate
 * @returns {boolean}
 */
export function isNowAfterStartDate(startDate: Date): boolean;
export function dateIsAfterToday(date: Date): boolean;
export function dateIsBeforeToday(date: Date): boolean;
export function dateIsToday(date: Date): boolean;
export type DateTimeParams = {
	year: number;
	month: number;
	day: number;
	hour?: number;
	minute?: number;
	second?: number;
	convertToUTC?: boolean;
};
