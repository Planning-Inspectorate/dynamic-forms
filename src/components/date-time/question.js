import { Question } from '../../questions/question.js';
import { formatDateForDisplay, parseDateInput } from '../../lib/date-utils.js';

const DEFAULT_DATE_FORMAT = 'd MMMM yyyy';
const DEFAULT_TIME_FORMAT = 'HH:mma';

export default class DateTimeQuestion extends Question {
	static AM = 'am';
	static PM = 'pm';

	/**
	 * @param {import('@planning-inspectorate/dynamic-forms/src/questions/question-types.js').QuestionParameters} params
	 * @param {string} [params.dateFormat]
	 * @param {string} [params.timeFormat]
	 */
	constructor({ dateFormat = DEFAULT_DATE_FORMAT, timeFormat = DEFAULT_TIME_FORMAT, ...params }) {
		super({
			...params,
			viewFolder: 'date-time'
		});
		this.dateFormat = dateFormat;
		this.timeFormat = timeFormat;
	}

	/**
	 * returns the data to send to the DB
	 * side effect: modifies journeyResponse with the new answers
	 * @param {import('express').Request} req
	 * @param {JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise.<Object>}
	 */
	async getDataToSave(req, journeyResponse) {
		let responseToSave = { answers: {} };

		const dayInput = req.body[`${this.fieldName}_day`];
		const monthInput = req.body[`${this.fieldName}_month`];
		const yearInput = req.body[`${this.fieldName}_year`];
		const hourInput = req.body[`${this.fieldName}_hour`];
		const minutesInput = req.body[`${this.fieldName}_minutes`];
		const periodInput = req.body[`${this.fieldName}_period`];

		responseToSave.answers[this.fieldName] = parseDateInput({
			day: dayInput,
			month: monthInput,
			year: yearInput,
			hour: this.#convertTo24Hour(hourInput, periodInput),
			minute: minutesInput
		});

		journeyResponse.answers[this.fieldName] = responseToSave.answers[this.fieldName];

		return responseToSave;
	}

	/**
	 * gets the view model for this question
	 * @param {Section} section - the current section
	 * @param {Journey} journey - the journey we are in
	 * @param {Object|undefined} [customViewData] additional data to send to view
	 * @returns {QuestionViewModel & { answer: Record<string, unknown> }}
	 */
	prepQuestionForRendering(section, journey, customViewData, payload) {
		let viewModel = super.prepQuestionForRendering(section, journey, customViewData);

		/** @type {Record<string, unknown>} */
		let answer = {};
		let day;
		let month;
		let year;
		let hour;
		let minutes;
		let period;

		if (payload) {
			day = payload[`${this.fieldName}_day`];
			month = payload[`${this.fieldName}_month`];
			year = payload[`${this.fieldName}_year`];
			hour = payload[`${this.fieldName}_hour`];
			minutes = payload[`${this.fieldName}_minutes`];
			period = payload[`${this.fieldName}_period`];
		} else {
			const answerDateString = journey.response.answers[this.fieldName];

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

		answer = {
			[`${this.fieldName}_day`]: day,
			[`${this.fieldName}_month`]: month,
			[`${this.fieldName}_year`]: year,
			[`${this.fieldName}_hour`]: hour,
			[`${this.fieldName}_minutes`]: minutes,
			[`${this.fieldName}_period`]: period
		};

		return { ...viewModel, answer, question: { ...viewModel.question, value: answer } };
	}

	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @type {Question['formatAnswerForSummary']}
	 */
	formatAnswerForSummary(sectionSegment, journey, answer) {
		return [
			{
				key: this.title,
				value: this.#formatDateTimeValue(answer),
				action: this.getAction(sectionSegment, journey, answer)
			}
		];
	}

	#formatDateTimeValue(answer) {
		if (!answer) return this.notStartedText;

		const formattedDate = formatDateForDisplay(answer, { format: this.dateFormat });
		const formattedTime = formatDateForDisplay(answer, { format: this.timeFormat });

		return `${formattedDate}<br>${formattedTime.toLowerCase()}`;
	}

	#convertTo24Hour(hour, period) {
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
