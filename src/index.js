/**
 * @typedef {import('./questions/question-props.js').QuestionTypes} QuestionTypes
 */

/**
 * @type {Readonly<{CHECKBOX: QuestionTypes, BOOLEAN: QuestionTypes, RADIO: QuestionTypes, DATE: QuestionTypes, DATE_PERIOD: QuestionTypes, TEXT_ENTRY: QuestionTypes, TEXT_ENTRY_REDACT: QuestionTypes, SELECT: QuestionTypes, SINGLE_LINE_INPUT: QuestionTypes, MULTI_FIELD_INPUT: QuestionTypes, NUMBER: QuestionTypes, ADDRESS: QuestionTypes, UNIT_OPTION: QuestionTypes, EMAIL: QuestionTypes}>}
 */
export const COMPONENT_TYPES = Object.freeze({
	CHECKBOX: 'checkbox',
	BOOLEAN: 'boolean',
	RADIO: 'radio',
	DATE: 'date',
	DATE_PERIOD: 'date-period',
	DATE_TIME: 'date-time',
	TEXT_ENTRY: 'text-entry',
	TEXT_ENTRY_REDACT: 'text-entry-redact',
	SELECT: 'select',
	SINGLE_LINE_INPUT: 'single-line-input',
	MULTI_FIELD_INPUT: 'multi-field-input',
	NUMBER: 'number',
	ADDRESS: 'site-address',
	UNIT_OPTION: 'unit-option',
	EMAIL: 'email',
	MANAGE_LIST: 'manage-list'
});
