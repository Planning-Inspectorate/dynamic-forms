/**
 * @typedef {'boolean' | 'checkbox' | 'date' | 'date-period' | 'date-time' | 'email' | 'manage-list' | 'multi-field-input' | 'number' | 'radio' | 'select' | 'single-line-input' | 'site-address' | 'text-entry' | 'text-entry-redact' | 'unit-option'} QuestionTypes
 */

/**
 * @import {JourneyResponse} from "../journey/journey-response.js"
 * @import {BaseValidator} from "../validator/base-validator.js"
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
 * @typedef {CommonQuestionProps & {type: 'boolean', options?: Option[], interfaceType?: 'checkbox' | 'radio'}} BooleanQuestionProps
 * @typedef {CommonQuestionProps & {type: 'checkbox', options: Option[]}} CheckboxQuestionProps
 * @typedef {CommonQuestionProps & {type: 'date'}} DateQuestionProps
 * @typedef {CommonQuestionProps & {type: 'date-period'}} DatePeriodQuestionProps
 * @typedef {CommonQuestionProps & {type: 'date-time'}} DateTimeQuestionProps
 * @typedef {CommonQuestionProps & {type: 'email'}} EmailQuestionProps
 * @typedef {CommonQuestionProps & {type: 'manage-list'}} ManageListQuestionProps
 * @typedef {CommonQuestionProps & {type: 'multi-field-input', inputAttributes?: Record<string, string>, inputFields: InputField[], formatType?: 'contactDetails' | 'standard'}} MultiFieldInputQuestionProps
 * @typedef {CommonQuestionProps & {type: 'multi-file-upload', documentType: DocType}} MultiFileUploadQuestionProps
 * @typedef {CommonQuestionProps & {type: 'number', suffix?: string}} NumberEntryQuestionProps
 * @typedef {CommonQuestionProps & {type: 'radio', options: Option[]}} RadioQuestionProps
 * @typedef {CommonQuestionProps & {type: 'select', options: Option[]}} SelectQuestionProps
 * @typedef {CommonQuestionProps & {type: 'single-line-input', inputAttributes?: Record<string, string>}} SingleLineInputQuestionProps
 * @typedef {CommonQuestionProps & {type: 'site-address'}} SiteAddressQuestionProps
 * @typedef {CommonQuestionProps & {type: 'text-entry'}} TextEntryQuestionProps
 * @typedef {CommonQuestionProps & {type: 'text-entry-redact'}} TextEntryRedactQuestionProps
 * @typedef {CommonQuestionProps & {type: 'unit-option', conditionalFieldName: string, options: UnitOption[]}} UnitOptionEntryQuestionProps
 */

/**
 * @typedef {CheckboxQuestionProps | MultiFileUploadQuestionProps | BooleanQuestionProps | RadioQuestionProps | DateQuestionProps | TextEntryQuestionProps | SingleLineInputQuestionProps | MultiFieldInputQuestionProps | NumberEntryQuestionProps | SiteAddressQuestionProps | UnitOptionEntryQuestionProps} QuestionProps
 */
