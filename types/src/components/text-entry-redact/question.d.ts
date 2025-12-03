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
export const REDACT_CHARACTER: "\u2588";
export const TRUNCATED_MAX_LENGTH: 500;
/**
 * @class
 */
export default class TextEntryRedactQuestion extends Question {
    /**
     * @param {import('#question-types').QuestionParameters} params
     * @param {TextEntryCheckbox} [params.textEntryCheckbox]
     * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
     * @param {boolean} [params.onlyShowRedactedValueForSummary] whether to only show redacted value for summary
     * @param {boolean} [params.useRedactedFieldNameForSave] whether to use the redacted field name when saving answers
     * @param {boolean} [params.showSuggestionsUi] use the suggestions UI for this question
     * @param {string} [params.summaryText] summaryText to use with the details component
     * @param {boolean} [params.shouldTruncateSummary] determines whether redacted comment is truncated in summary view
     */
    constructor({ textEntryCheckbox, label, onlyShowRedactedValueForSummary, useRedactedFieldNameForSave, showSuggestionsUi, summaryText, shouldTruncateSummary, ...params }: any);
    textEntryCheckbox: any;
    label: any;
    onlyShowRedactedValueForSummary: any;
    useRedactedFieldNameForSave: any;
    showSuggestionsUi: any;
    summaryText: any;
    shouldTruncateSummary: any;
    getDataToSave(req: any, journeyResponse: any): Promise<{
        answers: {};
    }>;
    prepQuestionForRendering(section: any, journey: any, customViewData: any, payload: any): import("../../questions/question.js").QuestionViewModel;
    formatAnswerForSummary(sectionSegment: any, journey: any, answer: any, capitals?: boolean): {
        key: string;
        value: string | any;
        action: {
            href: string;
            text: string;
            visuallyHiddenText: string;
        };
    }[] | {
        key: string;
        value: string;
        action: import("../../controller.js").ActionView | import("../../controller.js").ActionView[];
    }[];
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
