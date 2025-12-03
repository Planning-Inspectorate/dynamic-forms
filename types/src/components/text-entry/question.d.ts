/**
 * @typedef {import('../../questions/question.js').QuestionViewModel} QuestionViewModel
 * @typedef {import('../../journey/journey.js').Journey} Journey
 * @typedef {import('../../journey/journey-response.js').JourneyResponse} JourneyResponse
 * @typedef {import('../../section').Section} Section
 */
/**
 * @typedef {Object} TextEntryCheckbox
 * @property {string} header
 * @property {string} text
 * @property {string} name
 * @property {string} [errorMessage]
 */
/**
 * @class
 */
export default class TextEntryQuestion extends Question {
    /**
     * @param {import('#question-types').QuestionParameters} params
     * @param {TextEntryCheckbox} [params.textEntryCheckbox]
     * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
     */
    constructor({ textEntryCheckbox, label, ...params }: any);
    textEntryCheckbox: any;
    label: any;
    prepQuestionForRendering(section: any, journey: any, customViewData: any, payload: any): import("../../questions/question.js").QuestionViewModel;
}
export type QuestionViewModel = import("../../questions/question.js").QuestionViewModel;
export type Journey = import("../../journey/journey.js").Journey;
export type JourneyResponse = import("../../journey/journey-response.js").JourneyResponse;
export type Section = import("../../section").Section;
export type TextEntryCheckbox = {
    header: string;
    text: string;
    name: string;
    errorMessage?: string;
};
import { Question } from '../../questions/question.js';
