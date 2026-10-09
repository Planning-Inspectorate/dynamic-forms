import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { isAfter, isBefore, isValid } from 'date-fns';

const ukTimeZone = 'Europe/London';

/**
 * Display the date in Europe/London
 * @returns formatted date string or empty string if invalid value passed in
 */
export function formatDateForDisplay(date: Date | string, { format = 'd MMM yyyy' } = { format: 'd MMM yyyy' }) {
	if (!date || !isValid(new Date(date))) return '';

	return formatInTimeZone(date, ukTimeZone, format);
}

export interface DateTimeParams {
	year: number;
	month: number;
	day: number;
	hour?: number;
	minute?: number;
	second?: number;
	convertToUTC?: boolean;
}

/**
 * Parse the date and time parameters provided by a user
 */
export function parseDateInput({ year, month, day, hour = 0, minute = 0, second = 0 }: DateTimeParams) {
	const dateStr = `${year}-${pad(month)}-${pad(day)}`;
	const timeStr = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
	return fromZonedTime(`${dateStr} ${timeStr}`, ukTimeZone);
}

/**
 * Start of the day in UK time zone
 */
export function startOfDay() {
	const [year, month, day] = formatDateForDisplay(new Date(), { format: 'yyyy-MM-dd' }).split('-');

	return parseDateInput({
		year: parseInt(year),
		month: parseInt(month),
		day: parseInt(day),
		hour: 0,
		minute: 0,
		second: 0
	});
}

/**
 * End of the day in UK time zone
 */
export function endOfDay() {
	const [year, month, day] = formatDateForDisplay(new Date(), { format: 'yyyy-MM-dd' }).split('-');

	return parseDateInput({
		year: parseInt(year),
		month: parseInt(month),
		day: parseInt(day),
		hour: 23,
		minute: 59,
		second: 59
	});
}

/**
 * Pad a number with leading zeros
 */
function pad(num: number, length = 2) {
	return num.toString().padStart(length, '0');
}

export const dateIsAfterToday = (date: Date) => {
	return isValid(date) && isAfter(date, endOfDay());
};

export const dateIsBeforeToday = (date: Date) => {
	return isValid(date) && isBefore(date, startOfDay());
};

export const dateIsToday = (date: Date) => {
	return isValid(date) && !isBefore(date, startOfDay()) && !isAfter(date, endOfDay()) && isValid(date);
};

/**
 * Check if today is within the date range inclusive (start <= now <= end)
 */
export function nowIsWithinRange(startDate: Date, endDate: Date) {
	const now = new Date();

	if (!isValid(startDate) || !isValid(endDate) || isAfter(startDate, endDate)) {
		return false;
	}
	return !isBefore(now, startDate) && !isAfter(now, endDate);
}

/**
 * Check if today is on or after the start date
 */
export function isNowAfterStartDate(startDate: Date) {
	const now = new Date();

	if (!isValid(startDate)) {
		return false;
	}
	return !isBefore(now, startDate);
}
