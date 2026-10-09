import { formatDateForDisplay, parseDateInput } from '../../lib/date-utils.ts';
import { Question } from '../../questions/question.ts';
import { nl2br } from '../../lib/utils.ts';
import escape from 'escape-html';
import type { Request } from 'express';
import type { DatePeriodQuestionParams } from '../../types/question-props.ts';
import type { QuestionViewModel } from '../../types/question-types.ts';
const DEFAULT_DATE_FORMAT = 'HH:mm d MMMM yyyy';

type TimeParts = { hour: number; minute?: number; second?: number };

/**
 * Represents a date period, two dates which make up a period or range
 */
export class DatePeriodQuestion extends Question {
	dateFormat: string;
	labels: { start: string; end: string };
	hintStart?: string;
	hintEnd?: string;
	startTime: TimeParts;
	endTime: TimeParts;

	constructor({
		dateFormat = DEFAULT_DATE_FORMAT,
		hint,
		labels,
		hintStart,
		startTime,
		hintEnd,
		endTime,
		...parentParams
	}: DatePeriodQuestionParams) {
		super({
			...parentParams,
			viewFolder: 'date-period'
		});
		this.dateFormat = dateFormat;
		this.labels = labels || { start: 'Start', end: 'End' };
		this.hint = hint;
		this.hintStart = hintStart;
		this.hintEnd = hintEnd;
		this.startTime = startTime || { hour: 0, minute: 0, second: 0 };
		this.endTime = endTime || { hour: 0, minute: 0, second: 0 };
	}
	/**
	 * Gets the body field names used by this question in form submissions.
	 */
	get bodyFieldNames() {
		return [
			`${this.fieldName}_start_day`,
			`${this.fieldName}_start_month`,
			`${this.fieldName}_start_year`,
			`${this.fieldName}_end_day`,
			`${this.fieldName}_end_month`,
			`${this.fieldName}_end_year`
		];
	}
	/**
	 * Get the data to save from the request, returns an object of answers
	 */
	async getDataToSave(req: Request) {
		const answers: Record<string, unknown> = {};
		const startDayInput = req.body[`${this.fieldName}_start_day`];
		const startMonthInput = req.body[`${this.fieldName}_start_month`];
		const startYearInput = req.body[`${this.fieldName}_start_year`];
		const endDayInput = req.body[`${this.fieldName}_end_day`];
		const endMonthInput = req.body[`${this.fieldName}_end_month`];
		const endYearInput = req.body[`${this.fieldName}_end_year`];
		const startDate = parseDateInput({
			second: this.startTime.second,
			minute: this.startTime.minute,
			hour: this.startTime.hour,
			day: startDayInput,
			month: startMonthInput,
			year: startYearInput
		});
		const endDate = parseDateInput({
			second: this.endTime.second,
			minute: this.endTime.minute,
			hour: this.endTime.hour,
			day: endDayInput,
			month: endMonthInput,
			year: endYearInput
		});

		answers[this.fieldName] = { start: startDate, end: endDate };

		return { answers };
	}

	answerForViewModel(answers: Record<string, unknown>, isPayload: boolean) {
		let startDay;
		let startMonth;
		let startYear;
		let endDay;
		let endMonth;
		let endYear;

		if (isPayload) {
			startDay = answers[`${this.fieldName}_start_day`];
			startMonth = answers[`${this.fieldName}_start_month`];
			startYear = answers[`${this.fieldName}_start_year`];
			endDay = answers[`${this.fieldName}_end_day`];
			endMonth = answers[`${this.fieldName}_end_month`];
			endYear = answers[`${this.fieldName}_end_year`];
		} else {
			const answerPeriod = answers[this.fieldName] as { start?: string | Date; end?: string | Date } | undefined;
			if (answerPeriod && answerPeriod.start) {
				const startDate = new Date(answerPeriod.start);
				startDay = formatDateForDisplay(startDate, { format: 'd' });
				startMonth = formatDateForDisplay(startDate, { format: 'M' });
				startYear = formatDateForDisplay(startDate, { format: 'yyyy' });
			}
			if (answerPeriod && answerPeriod.end) {
				const endDate = new Date(answerPeriod.end);
				endDay = formatDateForDisplay(endDate, { format: 'd' });
				endMonth = formatDateForDisplay(endDate, { format: 'M' });
				endYear = formatDateForDisplay(endDate, { format: 'yyyy' });
			}
		}
		return {
			[`${this.fieldName}_start_day`]: startDay,
			[`${this.fieldName}_start_month`]: startMonth,
			[`${this.fieldName}_start_year`]: startYear,
			[`${this.fieldName}_end_day`]: endDay,
			[`${this.fieldName}_end_month`]: endMonth,
			[`${this.fieldName}_end_year`]: endYear
		};
	}
	addCustomDataToViewModel(viewModel: QuestionViewModel) {
		viewModel.labels = this.labels;
		viewModel.hintStart = this.hintStart;
		viewModel.hintEnd = this.hintEnd;
	}

	/**
	 * Formats the start/end date period for display in the summary.
	 */
	formatAnswer(answer: { start?: string | Date; end?: string | Date }) {
		if (!answer) {
			return this.notStartedText;
		}

		const start = answer.start && formatDateForDisplay(answer.start, { format: this.dateFormat });
		const end = answer.end && formatDateForDisplay(answer.end, { format: this.dateFormat });
		let formattedAnswer = '';
		if (start) {
			formattedAnswer += `${this.labels.start}: ${start}`;
			if (end) {
				formattedAnswer += `\n`;
			}
		}
		if (end) {
			formattedAnswer += `${this.labels.end}: ${end}`;
		}
		return nl2br(escape(formattedAnswer));
	}
}

export default DatePeriodQuestion;
