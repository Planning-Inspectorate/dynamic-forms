/**
 * @class
 */
export default class DateQuestion extends Question {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {string} [params.dateFormat]
	 */
	constructor({ dateFormat, ...params }: import('#question-types').QuestionParameters);
	dateFormat: any;
	/**
	 * Get the data to save from the request, returns an object of answers
	 * @param {import('express').Request} req
	 * @param {import('#journey-response').JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise.<Object>}
	 */ getDataToSave(req: any, journeyResponse: import('#journey-response').JourneyResponse): Promise<Object>;
	answerForViewModel(
		answers: any,
		isPayload: any
	): {
		[x: string]: any;
	};
}
import { Question } from '../../questions/question.js';
