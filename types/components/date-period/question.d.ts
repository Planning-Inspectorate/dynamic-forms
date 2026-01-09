/**
 * Represents a date period, two dates which make up a period or range
 * @class
 */
export default class DatePeriodQuestion {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {string} [params.dateFormat]
	 * @param {{start: string, end: string}} [params.labels]
	 * @param {{hour: number, minute: number, second: number}} [params.startTime]
	 * @param {{hour: number, minute: number, second: number}} [params.endTime]
	 */
	constructor({ dateFormat, labels, startTime, endTime, ...params }: any);
	dateFormat: any;
	labels: any;
	startTime: any;
	endTime: any;
	/**
	 * Get the data to save from the request, returns an object of answers
	 * @param {import('express').Request} req
	 * @param {import('#journey-response').JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise.<Object>}
	 */ getDataToSave(req: any, journeyResponse: any): Promise<any>;
	answerForViewModel(
		answers: any,
		isPayload: any
	): {
		[x: string]: any;
	};
	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel: any): void;
	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @type {Question['formatAnswerForSummary']}
	 */
	formatAnswerForSummary(
		sectionSegment: any,
		journey: any,
		answer: any
	): {
		key: any;
		value: any;
		action: any;
	}[];
}
