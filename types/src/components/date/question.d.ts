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
    prepQuestionForRendering(section: Section, journey: Journey, customViewData?: any | undefined, payload: any): QuestionViewModel & {
        answer: Record<string, unknown>;
    };
}
export type QuestionViewModel = import("../../questions/question.js").QuestionViewModel;
export type Journey = import("../../journey/journey.js").Journey;
export type JourneyResponse = import("../../journey/journey-response.js").JourneyResponse;
export type Section = import("../../section").Section;
import { Question } from '../../questions/question.js';
