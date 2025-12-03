export default class SelectQuestion extends OptionsQuestion {
    /**
     * @param {Object} params
     * @param {string} params.title
     * @param {string} params.question
     * @param {string} params.fieldName
     * @param {string} [params.viewFolder]
     * @param {string} [params.url]
     * @param {string} [params.hint]
     * @param {string} [params.pageTitle]
     * @param {string} [params.description]
     * @param {string} [params.label]
     * @param {string} [params.html]
     * @param {string} [params.legend] - optional legend, used instead of h1
     * @param {Array.<import('../../questions/options-question.js').Option>} params.options
     * @param {Object<string, any>} [params.viewData]
     * @param {Array.<import('../../questions/question.js').BaseValidator>} [params.validators]
     */
    constructor({ title, question, fieldName, viewFolder, url, hint, pageTitle, description, label, html, legend, options, validators, viewData }: {
        title: string;
        question: string;
        fieldName: string;
        viewFolder?: string;
        url?: string;
        hint?: string;
        pageTitle?: string;
        description?: string;
        label?: string;
        html?: string;
        legend?: string;
        options: Array<import("../../questions/options-question.js").Option>;
        viewData?: {
            [x: string]: any;
        };
        validators?: Array<import("../../questions/question.js").BaseValidator>;
    });
    label: string;
    legend: string;
    /**
     * adds label property to view model
     */
    prepQuestionForRendering(section: any, journey: any, customViewData: any, payload: any): import("../../questions/question.js").QuestionViewModel;
    /**
     * returns the formatted answers values to be used to build task list elements
     * note: only supports a single answer
     *
     * @param {Object} answer
     * @param {Journey} journey
     * @param {String} sectionSegment
     * @returns {Array.<Object>}
     */
    formatAnswerForSummary(sectionSegment: string, journey: Journey, answer: any): Array<any>;
}
import OptionsQuestion from '../../questions/options-question.js';
