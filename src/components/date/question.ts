import { formatDateForDisplay, parseDateInput } from '../../lib/date-utils.ts';
import { Question } from '../../questions/question.ts';
import type { Request } from 'express';
import type { DateQuestionParams } from '../../types/question-props.ts';

const DEFAULT_DATE_FORMAT = 'd MMMM yyyy';

export class DateQuestion extends Question {
	dateFormat: string;

	constructor({ dateFormat = DEFAULT_DATE_FORMAT, ...parentParams }: DateQuestionParams) {
		super({
			...parentParams,
			viewFolder: 'date'
		});
		this.dateFormat = dateFormat;
	}

	/**
	 * Gets the body field names used by this question in form submissions.
	 */
	get bodyFieldNames() {
		return [`${this.fieldName}_day`, `${this.fieldName}_month`, `${this.fieldName}_year`];
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 */
	async getDataToSave(req: Request) {
		const answers: Record<string, unknown> = {};

		const dayInput = req.body[`${this.fieldName}_day`];
		const monthInput = req.body[`${this.fieldName}_month`];
		const yearInput = req.body[`${this.fieldName}_year`];

		answers[this.fieldName] = parseDateInput({ day: dayInput, month: monthInput, year: yearInput });

		return { answers };
	}

	answerForViewModel(answers: Record<string, unknown>, isPayload: boolean) {
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
	 * Formats a date answer for display in the summary.
	 */
	formatAnswer(answer: unknown) {
		if (!answer) return this.notStartedText;
		return formatDateForDisplay(answer as Date | string, { format: this.dateFormat });
	}
}

export default DateQuestion;
