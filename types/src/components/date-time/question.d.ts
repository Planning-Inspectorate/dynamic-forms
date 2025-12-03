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
    #private;
}
import { Question } from '../../questions/question.js';
