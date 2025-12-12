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
export * from './components/address/question';
export * from './components/boolean/question';
export * from './components/checkbox/question';
export * from './components/date/question';
export * from './components/date-period/question';
export * from './components/multi-field-input/question';
export * from './components/number-entry/question';
export * from './components/radio/question';
export * from './components/select/question';
export * from './components/single-line-input/question';
export * from './components/text-entry/question';
export * from './components/text-entry-redact/question';
export * from './components/unit-option-entry/question';
export * from './components/utils/persisted-number-answer';
export { questionHasAnswer } from './components/utils/question-has-answer';
export * from './components/utils/question-utils';

// Controller
export * from './controller';

// Journey
export * from './journey/journey';
export { JourneyType, JourneyResponse } from './journey/journey-response';

// lib
export { Address } from './lib/address';
export { addressToViewModel } from './lib/address-utils';
export {
	formatDateForDisplay,
	parseDateInput,
	startOfDay,
	endOfDay,
	nowIsWithinRange,
	isNowAfterStartDate,
	dateIsAfterToday,
	dateIsBeforeToday,
	dateIsToday,
	DateTimeParams
} from './lib/date-utils';
export {
	buildSaveDataToSession,
	clearDataFromSession,
	buildGetJourneyResponseFromSession,
	saveDataToSession
} from './lib/session-answer-store';
export { nl2br, capitalize } from './lib/utils';

// middleware
export { buildGetJourney } from './middleware/build-get-journey';
export * from './middleware/check-not-submitted';
export * from './middleware/dynamic-req-files-to-req-body-files';
export { redirectToUnansweredQuestion } from './middleware/redirect-to-unanswered-question';

// Questions
export { Question, ActionLink, PreppedQuestion, QuestionViewModel } from './questions/question';
export { createQuestions } from './questions/create-questions';
import OptionsQuestion from './questions/options-question';
export { OptionsQuestion };
export { Option, OptionsViewModel } from './questions/options-question';
export { questionClasses } from './questions/questions';

// Section
export { Section } from './section';

// validators
import AddressValidator from './validator/address-validator';
export { AddressValidator };
import ConditionalRequiredValidator from './validator/conditional-required-validator';
export { ConditionalRequiredValidator };
import ConfirmationCheckboxValidator from './validator/confirmation-checkbox-validator';
export { ConfirmationCheckboxValidator };
import CoordinatesValidator from './validator/coordinates-validator';
export { CoordinatesValidator };
import DatePeriodValidator from './validator/date-period-validator';
export { DatePeriodValidator };
import DateTimeValidator from './validator/date-time-validator';
export { DateTimeValidator };
export type { DateQuestion, DateValidationSettings } from './validator/date-validator';
import DateValidator from './validator/date-validator';
export { DateValidator };
import DocumentUploadValidator from './validator/document-upload-validator';
export { DocumentUploadValidator };
export * from './validator/multi-field-input-validator';
import MultiFieldInputValidator from './validator/multi-field-input-validator';
export { MultiFieldInputValidator };
export { Regex, MinLength, MaxLength, Field } from './validator/multi-field-input-validator';
import NumericValidator from './validator/numeric-validator';
export { NumericValidator };
import RequiredFileUploadValidator from './validator/required-file-upload-validator';
export { RequiredFileUploadValidator };
import RequiredValidator from './validator/required-validator';
export { RequiredValidator };
import SameAnswerValidator from './validator/same-answer-validator';
export { SameAnswerValidator };
import StringValidator from './validator/string-validator';
export { StringValidator };
import UnitOptionEntryValidator from './validator/unit-option-entry-validator';
export { UnitOptionEntryValidator };
import ValidOptionValidator from './validator/valid-option-validator';
export { ValidOptionValidator };
export {
	expressValidationErrorsToGovUkErrorList,
	buildValidationErrorHandler,
	validationErrorHandler,
	GovUkErrorList,
	ExpressValidationErrors,
	ToErrorSummary
} from './validator/validation-error-handler';
