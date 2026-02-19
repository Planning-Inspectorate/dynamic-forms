/**
 * @import {RouteParams} from "#src/journey/journey-types.js"
 * @import {ManageListQuestion} from "#src/components/manage-list/question.js"
 * @import {BaseValidator} from "../validator/base-validator.js"
 * @import {JourneyResponse} from "../journey/journey-response.js"
 */

/**
 * @typedef {Object} ActionLink
 * @property {string} text
 * @property {string} href
 */

/**
 * @typedef {Object} QuestionParameters
 * @property {string} title
 * @property {string} question
 * @property {string} viewFolder
 * @property {string} fieldName
 * @property {string} [url]
 * @property {string} [pageTitle]
 * @property {string} [description]
 * @property {BaseValidator[]} [validators]
 * @property {string} [html]
 * @property {string} [hint]
 * @property {string} [interfaceType]
 * @property {(response: JourneyResponse) => boolean} [shouldDisplay]
 * @property {string} [autocomplete]
 * @property {boolean} [editable] - is this question editable? defaults to true
 * @property {ActionLink} [actionLink] - override the action link for this question
 * @property {Record<string, any>} [viewData] - static view data for this question
 */

/**
 * @typedef {Object} QuestionViewModel
 * @property {{value: string | number | Record<string, any>, question: string, fieldName: string, pageTitle: string, description?: string, html?: string}} question
 * @property {string} layoutTemplate
 * @property {string} pageCaption
 * @property {string} continueButtonText
 * @property {string} backLink
 * @property {string} showBackToListLink
 * @property {string} listLink
 * @property {string} journeyTitle
 * @property {*} [k]
 */

/**
 * @typedef {Object} PrepQuestionForRenderingOptions
 * @property {RouteParams} params
 * @property {ManageListQuestion} [manageListQuestion]
 */
