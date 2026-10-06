import AddressQuestion from '../components/address/question.ts';
import CheckboxQuestion from '../components/checkbox/question.ts';
import BooleanQuestion from '../components/boolean/question.ts';
import RadioQuestion from '../components/radio/question.ts';
import DateQuestion from '../components/date/question.ts';
import DatePeriodQuestion from '../components/date-period/question.ts';
import TextEntryQuestion from '../components/text-entry/question.ts';
import SelectQuestion from '../components/select/question.ts';
import SingleLineInputQuestion from '../components/single-line-input/question.ts';
import MultiFieldInputQuestion from '../components/multi-field-input/question.ts';
import NumberEntryQuestion from '../components/number-entry/question.ts';
import UnitOptionEntryQuestion from '../components/unit-option-entry/question.ts';
import EmailQuestion from '../components/email/question.ts';

import { COMPONENT_TYPES } from '../components/utils/component-types.ts';
import TextEntryRedactQuestion from '../components/text-entry-redact/question.ts';
import DateTimeQuestion from '../components/date-time/question.ts';
import ManageListQuestion from '../components/manage-list/question.ts';

/**
 * A map of component 'type' (or name') to question class
 *
 * Pass this to `createQuestions` to generate question instances based on the `type` field of `QuestionProps`.
 * To support custom questions, create a new object with these properties and the custom ones,
 * @example
 * ```
 * const classes = {
 *     ...questionClasses,
 *     ...myCustomQuestions
 * };
 * ```
 */
export const questionClasses = Object.freeze({
	[COMPONENT_TYPES.ADDRESS]: AddressQuestion,
	[COMPONENT_TYPES.CHECKBOX]: CheckboxQuestion,
	[COMPONENT_TYPES.BOOLEAN]: BooleanQuestion,
	[COMPONENT_TYPES.RADIO]: RadioQuestion,
	[COMPONENT_TYPES.DATE]: DateQuestion,
	[COMPONENT_TYPES.DATE_PERIOD]: DatePeriodQuestion,
	[COMPONENT_TYPES.DATE_TIME]: DateTimeQuestion,
	[COMPONENT_TYPES.TEXT_ENTRY]: TextEntryQuestion,
	[COMPONENT_TYPES.TEXT_ENTRY_REDACT]: TextEntryRedactQuestion,
	[COMPONENT_TYPES.SELECT]: SelectQuestion,
	[COMPONENT_TYPES.SINGLE_LINE_INPUT]: SingleLineInputQuestion,
	[COMPONENT_TYPES.MULTI_FIELD_INPUT]: MultiFieldInputQuestion,
	[COMPONENT_TYPES.NUMBER]: NumberEntryQuestion,
	[COMPONENT_TYPES.UNIT_OPTION]: UnitOptionEntryQuestion,
	[COMPONENT_TYPES.EMAIL]: EmailQuestion,
	[COMPONENT_TYPES.MANAGE_LIST]: ManageListQuestion
});
