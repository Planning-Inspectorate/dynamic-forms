/**
 * @typedef {import('../../questions/question.js').QuestionViewModel} QuestionViewModel
 * @typedef {import('../../journey/journey.js').Journey} Journey
 * @typedef {import('../../journey/journey-response.js').JourneyResponse} JourneyResponse
 * @typedef {import('../../section').Section} Section
 * @typedef {import('../../validator/base-validator')} BaseValidator
 */
/**
 * @class
 */
export default class SingleLineInputQuestion extends Question {
    /**
     * @param {import('#question-types').QuestionParameters} params
     * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
     * @param {Record<string, string>} [params.inputAttributes] html attributes to add to the input
     * @param {string} [params.classes] html classes to add to the input
     */
    constructor(params: any);
    /** @type {Record<string, string>} */
    inputAttributes: Record<string, string>;
    label: any;
    classes: any;
    prepQuestionForRendering(section: any, journey: any, customViewData: any, payload: any): import("../../questions/question.js").QuestionViewModel;
}
export type QuestionViewModel = import("../../questions/question.js").QuestionViewModel;
export type Journey = import("../../journey/journey.js").Journey;
export type JourneyResponse = import("../../journey/journey-response.js").JourneyResponse;
export type Section = import("../../section").Section;
export type BaseValidator = typeof import("../../validator/base-validator");
import { Question } from '../../questions/question.js';
