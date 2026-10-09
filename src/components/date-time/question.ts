import { Question } from '../../questions/question.ts';
import { formatDateForDisplay, parseDateInput } from '../../lib/date-utils.ts';
import type { Request } from 'express';
import type { DateTimeQuestionParams } from '../../types/question-props.ts';

const DEFAULT_DATE_FORMAT = 'd MMMM yyyy';
const DEFAULT_TIME_FORMAT = 'HH:mma';

export class DateTimeQuestion extends Question {
	static AM = 'am';
	static PM = 'pm';

	dateFormat: string;
	timeFormat: string;

	constructor({
		dateFormat = DEFAULT_DATE_FORMAT,
		timeFormat = DEFAULT_TIME_FORMAT,
		...parentParams
	}: DateTimeQuestionParams) {
		super({
			...parentParams,
			viewFolder: 'date-time'
		});
		this.dateFormat = dateFormat;
		this.timeFormat = timeFormat;
	}

	/**
	 * Gets the body field names used by this question in form submissions.
	 */
	get bodyFieldNames() {
		return [
			`${this.fieldName}_day`,
			`${this.fieldName}_month`,
			`${this.fieldName}_year`,
			`${this.fieldName}_hour`,
			`${this.fieldName}_minutes`,
			`${this.fieldName}_period`
		];
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 */
	async getDataToSave(req: Request) {
		const answers: Record<string, unknown> = {};

		const dayInput = req.body[`${this.fieldName}_day`];
		const monthInput = req.body[`${this.fieldName}_month`];
		const yearInput = req.body[`${this.fieldName}_year`];
		const hourInput = req.body[`${this.fieldName}_hour`];
		const minutesInput = req.body[`${this.fieldName}_minutes`];
		const periodInput = req.body[`${this.fieldName}_period`];

		answers[this.fieldName] = parseDateInput({
			day: dayInput,
			month: monthInput,
			year: yearInput,
			hour: this.#convertTo24Hour(hourInput, periodInput),
			minute: minutesInput
		});

		return { answers };
	}

	answerForViewModel(answers: Record<string, unknown>, isPayload: boolean) {
		let day;
		let month;
		let year;
		let hour;
		let minutes;
		let period;

		if (isPayload) {
			day = answers[`${this.fieldName}_day`];
			month = answers[`${this.fieldName}_month`];
			year = answers[`${this.fieldName}_year`];
			hour = answers[`${this.fieldName}_hour`];
			minutes = answers[`${this.fieldName}_minutes`];
			period = answers[`${this.fieldName}_period`];
		} else {
			const answerDateString = answers[this.fieldName];

			if (answerDateString && (typeof answerDateString === 'string' || answerDateString instanceof Date)) {
				const answerDate = new Date(answerDateString);
				day = formatDateForDisplay(answerDate, { format: 'd' });
				month = formatDateForDisplay(answerDate, { format: 'M' });
				year = formatDateForDisplay(answerDate, { format: 'yyyy' });
				hour = formatDateForDisplay(answerDate, { format: 'h' });
				minutes = formatDateForDisplay(answerDate, { format: 'mm' });
				period = formatDateForDisplay(answerDate, { format: 'aaa' });
			}
		}

		return {
			[`${this.fieldName}_day`]: day,
			[`${this.fieldName}_month`]: month,
			[`${this.fieldName}_year`]: year,
			[`${this.fieldName}_hour`]: hour,
			[`${this.fieldName}_minutes`]: minutes,
			[`${this.fieldName}_period`]: period
		};
	}

	/**
	 * Formats a date-time answer for display in the summary.
	 */
	formatAnswer(answer: unknown) {
		if (!answer) return this.notStartedText;

		const formattedDate = formatDateForDisplay(answer as Date | string, { format: this.dateFormat });
		const formattedTime = formatDateForDisplay(answer as Date | string, { format: this.timeFormat });

		return `${formattedDate}<br>${formattedTime.toLowerCase()}`;
	}

	#convertTo24Hour(hour: unknown, period: unknown) {
		const hourValue = Number(hour);
		switch (period) {
			case DateTimeQuestion.AM:
				return hourValue === 12 ? 0 : hourValue;
			case DateTimeQuestion.PM:
				return hourValue === 12 ? 12 : hourValue + 12;
			default:
				throw new Error("Period must be 'am' or 'pm'");
		}
	}
}

export default DateTimeQuestion;
