/**
 * @typedef {import('../../journey/journey.js').Journey} Journey
 */
/**
 * @typedef ConditionalAnswerObject
 * @type {object}
 * @property {string} value the checkbox answer
 * @property {string} conditional the conditional text input
 */
export default class CheckboxQuestion extends OptionsQuestion {
    /**
     * @param {Object} params
     * @param {string} params.title
     * @param {string} params.question
     * @param {string} params.fieldName
     * @param {string} [params.url]
     * @param {string} [params.pageTitle]
     * @param {string} [params.description]
     * @param {Array.<import('../../questions/options-question.js').Option>} params.options
     * @param {Array.<import('../../questions/question.js').BaseValidator>} [params.validators]
     */
    constructor({ title, question, fieldName, url, pageTitle, description, options, validators }: {
        title: string;
        question: string;
        fieldName: string;
        url?: string;
        pageTitle?: string;
        description?: string;
        options: Array<import("../../questions/options-question.js").Option>;
        validators?: Array<import("../../questions/question.js").BaseValidator>;
    });
    /**
     * returns the formatted answers values to be used to build task list elements
     * @param {string | ConditionalAnswerObject } answer will be a single value string, a comma-separated string representing multiple values (one of which may be a conditional) or a single ConditionalAnswerObject
     * @param {Journey} journey
     * @param {String} sectionSegment
     * @returns {Array.<Object>}
     */
    formatAnswerForSummary(sectionSegment: string, journey: Journey, answer: string | ConditionalAnswerObject): Array<any>;
}
export type Journey = import("../../journey/journey.js").Journey;
export type ConditionalAnswerObject = {
    /**
     * the checkbox answer
     */
    value: string;
    /**
     * the conditional text input
     */
    conditional: string;
};
import OptionsQuestion from '../../questions/options-question.js';
