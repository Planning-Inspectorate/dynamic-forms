import { QuestionTypes } from '../../index';

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
