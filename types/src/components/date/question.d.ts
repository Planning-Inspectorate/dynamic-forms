import { JourneyResponse, Section } from '../../section';

/**
 * @class
 */
export default class DateQuestion extends Question {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {string} [params.dateFormat]
	 */
	constructor({ dateFormat, ...params }: any);
	dateFormat: any;
	/**
	 * returns the data to send to the DB
	 * side effect: modifies journeyResponse with the new answers
	 * @param {import('express').Request} req
	 * @param {JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise.<Object>}
	 */
	getDataToSave(req: any, journeyResponse: JourneyResponse): Promise<any>;
	/**
	 * gets the view model for this question
	 * @param {Section} section - the current section
	 * @param {Journey} journey - the journey we are in
	 * @param {Object|undefined} [customViewData] additional data to send to view
	 * @returns {QuestionViewModel & { answer: Record<string, unknown> }}
	 */
	prepQuestionForRendering(
		section: Section,
		journey: Journey,
		payload: any,
		customViewData?: any | undefined
	): QuestionViewModel & {
		answer: Record<string, unknown>;
	};
}
import { Question } from '../../questions/question.js';
import { Journey } from '../../journey/journey';
import { QuestionViewModel } from '../../questions/question.js';
