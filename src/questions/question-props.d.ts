import { DocType } from '@pins/common/src/document-types';
import { JourneyResponse } from '../journey/journey-response';
import BaseValidator from '../validator/base-validator';

type QuestionTypes =
	| 'checkbox'
	| 'multi-file-upload'
	| 'boolean'
	| 'radio'
	| 'date'
	| 'date-period'
	| 'text-entry'
	| 'text-entry-redact'
	| 'select'
	| 'single-line-input'
	| 'multi-field-input'
	| 'number'
	| 'site-address'
	| 'unit-option';

interface CommonQuestionProps {
	type: QuestionTypes;
	title: string;
	question: string;
	viewFolder?: string;
	fieldName: string;
	url?: string;
	pageTitle?: string;
	description?: string;
	label?: string;
	validators?: BaseValidator[];
	html?: string;
	hint?: string;
	shouldDisplay?: (response: JourneyResponse) => boolean;
	autocomplete?: string;
}

type Option =
	| {
			text: string;
			value: string;
			hint?: object;
			checked?: boolean | undefined;
			attributes?: Record<string, string>;
			behaviour?: 'exclusive';
			conditional?: {
				question: string;
				type: string;
				fieldName: string;
				inputClasses?: string;
				html?: string;
				value?: unknown;
				label?: string;
				hint?: string;
			};
			conditionalText?: {
				html: string;
			};
	  }
	| { divider?: string };

interface InputField {
	fieldName: string;
	label: string;
	formatJoinString?: string; // optional property, used by formatAnswerForSummary (eg task list display), effective default to line break
	hint?: string;
}

/*
 * UnitOptions are the options displayed in the radio format - in this case the value
 * represents the unit.
 * Conditionals must be used to capture the relevant quantity.
 * Each conditional must have a fieldName which uses the conditionalFieldName from the
 * UnitOptionEntryQuestion object as a base, followed by an underscore and unit reference
 * eg 'siteAreaSquareMetres_hectares' - this is required for validation and saving to the DB
 */
interface UnitOption {
	text: string;
	value: string;
	hint?: object;
	checked?: boolean | undefined;
	attributes?: Record<string, string>;
	behaviour?: 'exclusive';
	conditional: {
		fieldName: string;
		suffix: string;
		value?: unknown;
		label?: string;
		hint?: string;
		conversionFactor?: number;
	};
}

type CheckboxQuestionProps = CommonQuestionProps & {
	type: 'checkbox';
	options: Option[];
};

type MultiFileUploadQuestionProps = CommonQuestionProps & {
	type: 'multi-file-upload';
	documentType: DocType;
};

type BooleanQuestionProps = CommonQuestionProps & {
	type: 'boolean';
	options?: Option[];
	interfaceType?: 'checkbox' | 'radio';
};

type RadioQuestionProps = CommonQuestionProps & {
	type: 'radio';
	options: Option[];
};

type DateQuestionProps = CommonQuestionProps & {
	type: 'date';
};

type TextEntryQuestionProps = CommonQuestionProps & {
	type: 'text-entry';
	label?: string;
};

type SingleLineInputQuestionProps = CommonQuestionProps & {
	type: 'single-line-input';
	label?: string;
	inputAttributes?: Record<string, string>;
};

type MultiFieldInputQuestionProps = CommonQuestionProps & {
	type: 'multi-field-input';
	label?: string;
	inputAttributes?: Record<string, string>;
	inputFields: InputField[];
	formatType?: 'contactDetails' | 'standard';
};

type NumberEntryQuestionProps = CommonQuestionProps & {
	type: 'number';
	label?: string;
	suffix?: string;
};

type SiteAddressQuestionProps = CommonQuestionProps & {
	type: 'site-address';
};

type UnitOptionEntryQuestionProps = CommonQuestionProps & {
	type: 'unit-option';
	conditionalFieldName: string;
	options: UnitOption[];
	label?: string;
};

export type QuestionProps =
	| CheckboxQuestionProps
	| MultiFileUploadQuestionProps
	| BooleanQuestionProps
	| RadioQuestionProps
	| DateQuestionProps
	| TextEntryQuestionProps
	| SingleLineInputQuestionProps
	| MultiFieldInputQuestionProps
	| NumberEntryQuestionProps
	| SiteAddressQuestionProps
	| UnitOptionEntryQuestionProps;
