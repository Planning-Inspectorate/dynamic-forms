import { JourneyResponse, Section } from '../../section';

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
	constructor({ dateFormat, labels, startTime, endTime, ...params }: any);
	dateFormat: any;
	labels: any;
	startTime: any;
	endTime: any;
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
	 * @param {Object|undefined} [payload] the current payload
	 * @returns {QuestionViewModel & { answer: Record<string, unknown> }}
	 */
	prepQuestionForRendering(
		section: Section,
		journey: Journey,
		customViewData?: any | undefined,
		payload?: any | undefined
	): QuestionViewModel & {
		answer: Record<string, unknown>;
	};
}
import { Question } from '../../questions/question.js';
import { Journey } from '../../journey/journey';
import { QuestionViewModel } from '../text-entry/question';
