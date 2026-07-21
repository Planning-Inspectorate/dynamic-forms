import type { QuestionParameters } from '#src/questions/question-types.d.ts';

type QuestionTypes =
	| 'boolean'
	| 'checkbox'
	| 'date'
	| 'date-period'
	| 'date-time'
	| 'email'
	| 'manage-list'
	| 'multi-field-input'
	| 'number'
	| 'radio'
	| 'select'
	| 'single-line-input'
	| 'site-address'
	| 'text-entry'
	| 'text-entry-redact'
	| 'unit-option';

/**
 * Base params that question classes need to function (NO type - that's routing metadata)
 */
export type CommonQuestionParams = Omit<QuestionParameters, 'viewFolder'>;

/**
 * Full props including type for routing/factory layer
 */
type CommonQuestionProps = CommonQuestionParams & {
	type: QuestionTypes;
};

/**
 * Generic question props type so that custom components can be used without having to define a new type for each one.
 */
export type BaseQuestionProps = CommonQuestionParams & {
	type: string;
};

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

type Affix = {
	text: string;
	classes?: string;
};

interface InputField {
	fieldName: string;
	label: string;
	formatJoinString?: string; // used by formatAnswerForSummary (e.g. task list display), effective default to line break
	formatPrefix?: string; // used by formatAnswerForSummary (e.g. task list display), to prefix answer
	formatTextFunction?: (text: string) => string; // used to format the answer for display and value in question
	attributes?: Record<string, string>; // used to add HTML attributes to the field
	suffix?: Affix; // used to add a suffix to the field
	prefix?: Affix; // used to add a prefix to the field
	hint?: string;
	classes?: string;
	inputmode?: 'decimal' | 'numeric';
	pattern?: string; // Used for backwards-compatibility for older iOS devices in numeric input fields
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

/**
 * Internal base params for questions with options - not exported
 */
type OptionsQuestionParams = CommonQuestionParams & {
	options: Option[];
};

export type BooleanQuestionParams = Omit<RadioQuestionParams, 'options'> & {
	options?: Option[];
	interfaceType?: 'checkbox' | 'radio';
};

type BooleanQuestionProps = BooleanQuestionParams & {
	type: 'boolean';
};

export type CheckboxQuestionParams = OptionsQuestionParams;

type CheckboxQuestionProps = CheckboxQuestionParams & {
	type: 'checkbox';
};

export type DateQuestionParams = CommonQuestionParams & {
	dateFormat?: string;
};

type DateQuestionProps = DateQuestionParams & {
	type: 'date';
};

// Minute and second will default to 0 if not provided
interface TimeComponents {
	hour: number;
	minute?: number;
	second?: number;
}

export type DatePeriodQuestionParams = CommonQuestionParams & {
	dateFormat?: string;
	labels?: { start: string; end: string };
	hintStart?: string;
	hintEnd?: string;
	startTime?: TimeComponents;
	endTime?: TimeComponents;
};

type DatePeriodQuestionProps = DatePeriodQuestionParams & {
	type: 'date-period';
};

export type DateTimeQuestionParams = CommonQuestionParams & {
	dateFormat?: string;
	timeFormat?: string;
};

type DateTimeQuestionProps = DateTimeQuestionParams & {
	type: 'date-time';
};

export type ManageListQuestionParams = CommonQuestionParams & {
	titleSingular?: string;
	showManageListQuestions?: boolean;
	showAnswersInSummary?: boolean;
	confirmationQuestion?: string;
};

type ManageListQuestionProps = ManageListQuestionParams & {
	type: 'manage-list';
};

export type EmailQuestionParams = SingleLineInputQuestionParams & {
	autocomplete?: string; // autocomplete attribute value (defaults to 'email')
};

type EmailQuestionProps = EmailQuestionParams & {
	type: 'email';
};

export type MultiFieldInputQuestionParams = CommonQuestionParams & {
	inputFields: InputField[];
};

export type MultiFieldInputQuestionProps = MultiFieldInputQuestionParams & {
	type: 'multi-field-input';
};

export type NumberEntryQuestionParams = CommonQuestionParams & {
	suffix?: string;
	label?: string;
};

type NumberEntryQuestionProps = NumberEntryQuestionParams & {
	type: 'number';
};

export type RadioQuestionParams = OptionsQuestionParams & {
	label?: string;
	legend?: string;
};

type RadioQuestionProps = RadioQuestionParams & {
	type: 'radio';
};

export type SelectQuestionParams = OptionsQuestionParams & {
	disableAccessibleAutocomplete?: boolean;
	label?: string;
	legend?: string;
};

type SelectQuestionProps = SelectQuestionParams & {
	type: 'select';
};

export type SingleLineInputQuestionParams = CommonQuestionParams & {
	inputAttributes?: Record<string, string>; // HTML attributes to add to the input
	label?: string; // if defined this will show as a label for the input and the question will just be a standard h1
	classes?: string; // HTML classes to add to the input
};

type SingleLineInputQuestionProps = SingleLineInputQuestionParams & {
	type: 'single-line-input';
};

export type SiteAddressQuestionParams = CommonQuestionParams;

type SiteAddressQuestionProps = SiteAddressQuestionParams & {
	type: 'site-address';
};

type TextEntryCheckbox = {
	header: string;
	text: string;
	name: string;
	errorMessage?: string;
};

export type TextEntryQuestionParams = CommonQuestionParams & {
	textEntryCheckbox?: TextEntryCheckbox;
	label?: string; // if defined this will show as a label for the input and the question will just be a standard h1
};

type TextEntryQuestionProps = TextEntryQuestionParams & {
	type: 'text-entry';
};

export type TextEntryRedactQuestionParams = CommonQuestionParams & {
	textEntryCheckbox?: TextEntryCheckbox;
	label?: string; // if defined this will show as a label for the input and the question will just be a standard h1
	onlyShowRedactedValueForSummary?: boolean;
	useRedactedFieldNameForSave?: boolean;
	showSuggestionsUi?: boolean;
	summaryText?: string; // summaryText to use with the details component
	shouldTruncateSummary?: boolean; // determines whether redacted comment is truncated in summary view
};

type TextEntryRedactQuestionProps = TextEntryRedactQuestionParams & {
	type: 'text-entry-redact';
};

export type UnitOptionEntryQuestionParams = CommonQuestionParams & {
	conditionalFieldName: string; // will be the quantity and is captured by the conditional in the options
	options: UnitOption[];
	label?: string;
};

type UnitOptionEntryQuestionProps = UnitOptionEntryQuestionParams & {
	type: 'unit-option';
};

export type QuestionProps =
	| BooleanQuestionProps
	| CheckboxQuestionProps
	| DateQuestionProps
	| DatePeriodQuestionProps
	| DateTimeQuestionProps
	| ManageListQuestionProps
	| EmailQuestionProps
	| MultiFieldInputQuestionProps
	| NumberEntryQuestionProps
	| RadioQuestionProps
	| SelectQuestionProps
	| SingleLineInputQuestionProps
	| SiteAddressQuestionProps
	| TextEntryQuestionProps
	| TextEntryRedactQuestionProps
	| UnitOptionEntryQuestionProps;
