/**
 * @typedef {import('./questions/question-props.js').QuestionTypes} QuestionTypes
 */

/**
 * @type {Readonly<{CHECKBOX: QuestionTypes, BOOLEAN: QuestionTypes, RADIO: QuestionTypes, DATE: QuestionTypes, DATE_PERIOD: QuestionTypes, TEXT_ENTRY: QuestionTypes, TEXT_ENTRY_REDACT: QuestionTypes, SELECT: QuestionTypes, SINGLE_LINE_INPUT: QuestionTypes, MULTI_FIELD_INPUT: QuestionTypes, NUMBER: QuestionTypes, ADDRESS: QuestionTypes, UNIT_OPTION: QuestionTypes}>}
 */
export const COMPONENT_TYPES: Readonly<{
	CHECKBOX: QuestionTypes;
	BOOLEAN: QuestionTypes;
	RADIO: QuestionTypes;
	DATE: QuestionTypes;
	DATE_PERIOD: QuestionTypes;
	TEXT_ENTRY: QuestionTypes;
	TEXT_ENTRY_REDACT: QuestionTypes;
	SELECT: QuestionTypes;
	SINGLE_LINE_INPUT: QuestionTypes;
	MULTI_FIELD_INPUT: QuestionTypes;
	NUMBER: QuestionTypes;
	ADDRESS: QuestionTypes;
	UNIT_OPTION: QuestionTypes;
}>;
export type QuestionTypes = any;

// Components
export * from './components/index.d.ts';

// Controller
export * from './controller.d.ts';

// Journey
export * from './journey/index.d.ts';

// lib
export * from './lib/index.d.ts';

// middleware
export * from './middleware/index.d.ts';

// Questions
export * from './questions/index.d.ts';

// Section
export { Section } from './section.d.ts';

// validators
export * from './validator/index.d.ts';
