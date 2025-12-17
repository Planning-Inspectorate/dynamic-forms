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

// Components
// export * from './components/address/question';
import AddressQuestion from './components/address/question.js';
export { AddressQuestion };
export * from './components/boolean/question.js';
export * from './components/checkbox/question.js';
export * from './components/date/question.js';
export * from './components/date-period/question.js';
export * from './components/multi-field-input/question.js';
export * from './components/number-entry/question.js';
export * from './components/radio/question.js';
export * from './components/select/question.js';
export * from './components/single-line-input/question.js';
export * from './components/text-entry/question.js';
export * from './components/text-entry-redact/question.js';
export * from './components/unit-option-entry/question.js';
export * from './components/utils/persisted-number-answer.js';
export * from './components/utils/question-has-answer.js';
export * from './components/utils/question-utils.js';

// Controller
export * from './controller.js';

// Journey
export { Journey } from './journey/journey';
export { JourneyType, JourneyResponse } from './journey/journey-response.js';

// lib
export * from './lib/address.js';
export * from './lib/address-utils.js';
export * from './lib/date-utils.js';
export * from './lib/session-answer-store.js';
export * from './lib/utils.js';

// middleware
export * from './middleware/build-get-journey.js';
export * from './middleware/check-not-submitted.js';
export * from './middleware/dynamic-req-files-to-req-body-files.js';
export * from './middleware/redirect-to-unanswered-question.js';

// Questions
export { Question } from './questions/question.js';
export { createQuestions } from './questions/create-questions.js';
export * from './questions/options-question.js';
export { questionClasses } from './questions/questions.js';

// Section
export { Section } from './section.js';

// validators
export * from './validator/address-validator.js';
export * from './validator/base-validator.js';
export * from './validator/conditional-required-validator.js';
export * from './validator/confirmation-checkbox-validator.js';
export * from './validator/coordinates-validator.js';
export * from './validator/date-period-validator.js';
export * from './validator/date-time-validator.js';
export { DateQuestion, DateValidationSettings } from './validator/date-validator.js';
import DateValidator from './validator/date-validator.js';
export { DateValidator };
export * from './validator/document-upload-validator.js';
export * from './validator/multi-field-input-validator.js';
export * from './validator/numeric-validator.js';
export * from './validator/required-file-upload-validator.js';
export { default as RequiredValidator } from './validator/required-validator.js';
export * from './validator/same-answer-validator.js';
import StringValidator from './validator/string-validator.js';
export { StringValidator };
export * from './validator/unit-option-entry-validator.js';
export * from './validator/valid-option-validator.js';
export * from './validator/validation-error-handler.js';
import validate from './validator/validator.js';
export { validate };
export * from './validator/validator.js';
