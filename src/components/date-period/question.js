import { formatDateForDisplay, parseDateInput } from '../../lib/date-utils.js';
import { Question } from '#question';
import { nl2br } from '../../lib/utils.js';
import escape from 'escape-html';

const DEFAULT_DATE_FORMAT = 'HH:mm d MMMM yyyy';

/**
 * Represents a date period, two dates which make up a period or range
 * @class
 */
export default class DatePeriodQuestion extends Question {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {string} [params.dateFormat]
	 * @param {{start: string, end: string}} [params.labels]
	 * @param {{hour: number, minute: number, second: number}} [params.startTime]
	 * @param {{hour: number, minute: number, second: number}} [params.endTime]
	 */
	constructor({ dateFormat = DEFAULT_DATE_FORMAT, labels, startTime, endTime, ...params }) {
		super({
			...params,
			viewFolder: 'date-period'
		});
		this.dateFormat = dateFormat;
		this.labels = labels || { start: 'Start', end: 'End' };
		this.startTime = startTime || { hour: 0, minute: 0, second: 0 };
		this.endTime = endTime || { hour: 0, minute: 0, second: 0 };
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 * @param {import('express').Request} req
	 * @param {import('#journey-response').JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise.<Object>}
	 */ //eslint-disable-next-line no-unused-vars -- journeyResponse kept for other questions to use
	async getDataToSave(req, journeyResponse) {
		const answers = {};

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

	answerForViewModel(answers, isPayload) {
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
			const answerPeriod = answers[this.fieldName];
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

	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel) {
		viewModel.labels = this.labels;
	}

	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @type {Question['formatAnswerForSummary']}
	 */
	formatAnswerForSummary(sectionSegment, journey, answer) {
		let formattedAnswer;

		if (answer) {
			const start = answer.start && formatDateForDisplay(answer.start, { format: this.dateFormat });
			const end = answer.end && formatDateForDisplay(answer.end, { format: this.dateFormat });
			formattedAnswer = '';
			if (start) {
				formattedAnswer += `${this.labels.start}: ${start}`;
				if (end) {
					formattedAnswer += `\n`;
				}
			}
			if (end) {
				formattedAnswer += `${this.labels.end}: ${end}`;
			}
			formattedAnswer = nl2br(escape(formattedAnswer));
		} else {
			formattedAnswer = this.notStartedText;
		}

		const action = this.getAction(sectionSegment, journey, answer);
		const key = this.title ?? this.question;

		return [{ key: key, value: formattedAnswer, action: action }];
	}
}
