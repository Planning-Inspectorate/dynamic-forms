/**
 * @typedef {import('./questions/question-props.js').QuestionTypes} QuestionTypes
 */

/**
 * @type {Readonly<{CHECKBOX: QuestionTypes, BOOLEAN: QuestionTypes, RADIO: QuestionTypes, DATE: QuestionTypes, DATE_PERIOD: QuestionTypes, TEXT_ENTRY: QuestionTypes, TEXT_ENTRY_REDACT: QuestionTypes, SELECT: QuestionTypes, SINGLE_LINE_INPUT: QuestionTypes, MULTI_FIELD_INPUT: QuestionTypes, NUMBER: QuestionTypes, ADDRESS: QuestionTypes, UNIT_OPTION: QuestionTypes}>}
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
	UNIT_OPTION: 'unit-option'
});

// Controller
export * from './controller';

// Journey
export { Journey } from './journey/journey';
export { JourneyType, JourneyResponse } from './journey/journey-response';

// lib
export * from './lib/address';
export * from './lib/address-utils';
export * from './lib/date-utils';
export * from './lib/session-answer-store';
export * from './lib/utils';

// middleware
export * from './middleware/build-get-journey';
export * from './middleware/check-not-submitted';
export * from './middleware/dynamic-req-files-to-req-body-files';
export * from './middleware/redirect-to-unanswered-question';

// Questions
export { Question } from './questions/question';
export { createQuestions } from './questions/create-questions';
export * from './questions/options-question';
export { questionClasses } from './questions/questions';

// Section
export { Section } from './section';

// validators
export * from './validator/address-validator';
export * from './validator/base-validator';
export * from './validator/conditional-required-validator';
export * from './validator/confirmation-checkbox-validator';
export * from './validator/coordinates-validator';
export * from './validator/date-period-validator';
export * from './validator/date-time-validator';
export { DateQuestion, DateValidationSettings } from './validator/date-validator';
import DateValidator from './validator/date-validator';
export { DateValidator };
export * from './validator/document-upload-validator';
export * from './validator/multi-field-input-validator';
export * from './validator/numeric-validator';
export * from './validator/required-file-upload-validator';
export { default as RequiredValidator } from './validator/required-validator.js';
export * from './validator/same-answer-validator';
import StringValidator from './validator/string-validator';
export { StringValidator };
export * from './validator/unit-option-entry-validator';
export * from './validator/valid-option-validator';
export * from './validator/validation-error-handler';
export * from './validator/validator';
