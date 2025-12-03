/**
 * @typedef {import('../../journey/journey.js').Journey} Journey
 */
export default class NumberEntryQuestion extends Question {
    /**
     * @param {import('#question-types').QuestionParameters} params
     * @param {string} [params.suffix]
     * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
     */
    constructor({ label, suffix, ...params }: any);
    suffix: any;
    label: any;
    /**
     * adds label and suffix property to view model
     */
    prepQuestionForRendering(section: any, journey: any, customViewData: any, payload: any): import("../../questions/question.js").QuestionViewModel;
    /**
     * returns the formatted answers values to be used to build task list elements
     * @param {Object} answer
     * @param {Journey} journey
     * @param {String} sectionSegment
     * @returns {Array<{
     *   key: string;
     *   value: string | Object;
     *   action: {
     *     href: string;
     *     text: string;
     *     visuallyHiddenText: string;
     *   };
     * }>}
     */
    formatAnswerForSummary(sectionSegment: string, journey: Journey, answer: any): Array<{
        key: string;
        value: string | any;
        action: {
            href: string;
            text: string;
            visuallyHiddenText: string;
        };
    }>;
}
export type Journey = import("../../journey/journey.js").Journey;
import { Question } from '../../questions/question.js';
