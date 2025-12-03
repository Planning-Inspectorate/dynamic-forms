/**
 * @typedef {import('../../journey/journey-response.js').JourneyResponse} JourneyResponse
 * @typedef {import('../../journey/journey.js').Journey} Journey
 * @typedef {import('../../section.js').Section} Section
 * @typedef {import('../../questions/question.js').QuestionViewModel} QuestionViewModel
 * @typedef {import('appeals-service-api').Api.SubmissionAddress} SubmissionAddress

 */
export default class AddressQuestion extends Question {
    /**
     * @param {import('#question-types').QuestionParameters} params
     */
    constructor(params: any);
    requiredFields: {
        [key: string]: boolean;
    };
    addressLabels: {
        addressLine1: string;
        addressLine2: string;
        townCity: string;
        county: string;
        postcode: string;
    };
    /**
     * @param {Section} section
     * @param {Journey} journey
     * @param {Record<string, unknown>} customViewData
     * @returns {QuestionViewModel}
     */
    prepQuestionForRendering(section: Section, journey: Journey, customViewData: Record<string, unknown>): QuestionViewModel;
    /**
     * @param {Object<string, any>} answer
     * @returns The formatted address to be presented in the UI
     */
    format(answer: {
        [x: string]: any;
    }): string;
    formatLabelFromRequiredFields(fieldName: any): "" | " (optional)";
}
export type JourneyResponse = import("../../journey/journey-response.js").JourneyResponse;
export type Journey = import("../../journey/journey.js").Journey;
export type Section = import("../../section.js").Section;
export type QuestionViewModel = import("../../questions/question.js").QuestionViewModel;
export type SubmissionAddress = any;
import { Question } from '../../questions/question.js';
