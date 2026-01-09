import { formatDateForDisplay, parseDateInput } from '../../lib/date-utils.js';
import { Question } from '../../questions/question.js';

const DEFAULT_DATE_FORMAT = 'd MMMM yyyy';

/**
 * @class
 */
export default class DateQuestion extends Question {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {string} [params.dateFormat]
	 */
	constructor({ dateFormat = DEFAULT_DATE_FORMAT, ...params }) {
		super({
			...params,
			viewFolder: 'date'
		});
		this.dateFormat = dateFormat;
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 * @param {import('express').Request} req
	 * @param {import('#journey-response').JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise.<Object>}
	 */ //eslint-disable-next-line no-unused-vars -- journeyResponse kept for other questions to use
	async getDataToSave(req, journeyResponse) {
		const answers = {};

		const dayInput = req.body[`${this.fieldName}_day`];
		const monthInput = req.body[`${this.fieldName}_month`];
		const yearInput = req.body[`${this.fieldName}_year`];

		answers[this.fieldName] = parseDateInput({ day: dayInput, month: monthInput, year: yearInput });

		return { answers };
	}

	answerForViewModel(answers, isPayload) {
		let day;
		let month;
		let year;

		if (isPayload && answers) {
			day = answers[`${this.fieldName}_day`];
			month = answers[`${this.fieldName}_month`];
			year = answers[`${this.fieldName}_year`];
		} else {
			const answerDateString = answers[this.fieldName];
			if (answerDateString && (typeof answerDateString === 'string' || answerDateString instanceof Date)) {
				const answerDate = new Date(answerDateString);
				day = formatDateForDisplay(answerDate, { format: 'd' });
				month = formatDateForDisplay(answerDate, { format: 'M' });
				year = formatDateForDisplay(answerDate, { format: 'yyyy' });
			}
		}

		return {
			[`${this.fieldName}_day`]: day,
			[`${this.fieldName}_month`]: month,
			[`${this.fieldName}_year`]: year
		};
	}

	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @type {Question['formatAnswerForSummary']}
	 */
	formatAnswerForSummary(sectionSegment, journey, answer) {
		let formattedAnswer;

		if (answer) {
			formattedAnswer = formatDateForDisplay(answer, { format: this.dateFormat });
		} else {
			formattedAnswer = this.notStartedText;
		}

		const action = this.getAction(sectionSegment, journey, answer);
		const key = this.title ?? this.question;

		return [{ key: key, value: formattedAnswer, action: action }];
	}
}
