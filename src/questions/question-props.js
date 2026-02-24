/**
 * @typedef {'checkbox' | 'multi-file-upload' | 'boolean' | 'radio' | 'date' | 'date-period' | 'text-entry' | 'text-entry-redact' | 'select' | 'single-line-input' | 'multi-field-input' | 'number' | 'site-address' | 'unit-option' | 'manage-list'} QuestionTypes
 */

/**
 * @import {JourneyResponse} from "../journey/journey-response"
 * @import {BaseValidator} from "../validator/base-validator"
 * @import {DocType} from "@pins/common/src/document-types"
 */

/**
 * @typedef {Object} CommonQuestionProps
 * @property {QuestionTypes} type
 * @property {string} title
 * @property {string} question
 * @property {string} [viewFolder]
 * @property {string} fieldName
 * @property {string} [url]
 * @property {string} [pageTitle]
 * @property {string} [description]
 * @property {string} [label]
 * @property {BaseValidator[]} [validators]
 * @property {string} [html]
 * @property {string} [hint]
 * @property {(response: JourneyResponse) => boolean} [shouldDisplay]
 * @property {string} [autocomplete]
 */

/**
 * @typedef {Object} OptionConditional
 * @property {string} question
 * @property {string} type
 * @property {string} fieldName
 * @property {string} [inputClasses]
 * @property {string} [html]
 * @property {unknown} [value]
 * @property {string} [label]
 * @property {string} [hint]
 */

/**
 * @typedef {Object} OptionWithText
 * @property {string} text
 * @property {string} value
 * @property {object} [hint]
 * @property {boolean} [checked]
 * @property {Record<string, string>} [attributes]
 * @property {'exclusive'} [behaviour]
 * @property {OptionConditional} [conditional]
 * @property {{html: string}} [conditionalText]
 */

/**
 * @typedef {Object} OptionDivider
 * @property {string} [divider]
 */

/**
 * @typedef {OptionWithText | OptionDivider} Option
 */

/**
 * @typedef {Object} InputField
 * @property {string} fieldName
 * @property {string} label
 * @property {string} [formatJoinString]
 * @property {string} [hint]
 */

/**
 * @typedef {Object} UnitOptionConditional
 * @property {string} fieldName
 * @property {string} suffix
 * @property {unknown} [value]
 * @property {string} [label]
 * @property {string} [hint]
 * @property {number} [conversionFactor]
 */

/**
 * @typedef {Object} UnitOption
 * @property {string} text
 * @property {string} value
 * @property {object} [hint]
 * @property {boolean} [checked]
 * @property {Record<string, string>} [attributes]
 * @property {'exclusive'} [behaviour]
 * @property {UnitOptionConditional} conditional
 */

/**
 * @typedef {CommonQuestionProps & {type: 'checkbox', options: Option[]}} CheckboxQuestionProps
 * @typedef {CommonQuestionProps & {type: 'multi-file-upload', documentType: DocType}} MultiFileUploadQuestionProps
 * @typedef {CommonQuestionProps & {type: 'boolean', options?: Option[], interfaceType?: 'checkbox' | 'radio'}} BooleanQuestionProps
 * @typedef {CommonQuestionProps & {type: 'radio', options: Option[]}} RadioQuestionProps
 * @typedef {CommonQuestionProps & {type: 'date'}} DateQuestionProps
 * @typedef {CommonQuestionProps & {type: 'text-entry', label?: string}} TextEntryQuestionProps
 * @typedef {CommonQuestionProps & {type: 'single-line-input', label?: string, inputAttributes?: Record<string, string>}} SingleLineInputQuestionProps
 * @typedef {CommonQuestionProps & {type: 'multi-field-input', label?: string, inputAttributes?: Record<string, string>, inputFields: InputField[], formatType?: 'contactDetails' | 'standard'}} MultiFieldInputQuestionProps
 * @typedef {CommonQuestionProps & {type: 'number', label?: string, suffix?: string}} NumberEntryQuestionProps
 * @typedef {CommonQuestionProps & {type: 'site-address'}} SiteAddressQuestionProps
 * @typedef {CommonQuestionProps & {type: 'unit-option', conditionalFieldName: string, options: UnitOption[], label?: string}} UnitOptionEntryQuestionProps
 */

/**
 * @typedef {CheckboxQuestionProps | MultiFileUploadQuestionProps | BooleanQuestionProps | RadioQuestionProps | DateQuestionProps | TextEntryQuestionProps | SingleLineInputQuestionProps | MultiFieldInputQuestionProps | NumberEntryQuestionProps | SiteAddressQuestionProps | UnitOptionEntryQuestionProps} QuestionProps
 */
