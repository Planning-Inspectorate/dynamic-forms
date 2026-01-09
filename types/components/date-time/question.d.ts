export default class DateTimeQuestion extends Question {
	static AM: string;
	static PM: string;
	/**
	 * @param {import('@planning-inspectorate/dynamic-forms/src/questions/question-types.js').QuestionParameters} params
	 * @param {string} [params.dateFormat]
	 * @param {string} [params.timeFormat]
	 */
	constructor({ dateFormat, timeFormat, ...params }: any);
	dateFormat: any;
	timeFormat: any;
	/**
	 * Get the data to save from the request, returns an object of answers
	 * @param {import('express').Request} req
	 * @param {JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise.<Object>}
	 */ getDataToSave(req: any, journeyResponse: JourneyResponse): Promise<any>;
	answerForViewModel(
		answers: any,
		isPayload: any
	): {
		[x: string]: any;
	};
	#private;
}
import { Question } from '../../questions/question.js';
