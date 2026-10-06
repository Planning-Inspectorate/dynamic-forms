import type { QuestionParameters } from './question-types.d.ts';
import type { Question } from '../src/questions/question.js';
import type { Journey } from '../src/journey/journey.js';
import type { JourneyAnswers } from './journey-types.d.ts';

/**
 * Context passed to the custom summary formatter
 */
export interface SummaryFormatterContext<TAnswer = unknown, Answers extends object = JourneyAnswers> {
	/** The raw answer value */
	answer: TAnswer;
	/** The default display value */
	formattedAnswer: string;
	/** The question instance */
	question: Question<Answers>;
	/** The journey instance */
	journey: Journey<Answers>;
	/** The section segment */
	sectionSegment: string;
}

/**
 * Custom function to format the summary display value
 */
export type SummaryValueFormatter<TAnswer = unknown, Answers extends object = JourneyAnswers> = (
	context: SummaryFormatterContext<TAnswer, Answers>
) => string;

export type QuestionTypes =
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
export type CommonQuestionParams<Answers extends object = JourneyAnswers> = Omit<
	QuestionParameters<Answers>,
	'viewFolder'
>;

/**
 * Full props including type for routing/factory layer
 */
export type CommonQuestionProps<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers> & {
	type: QuestionTypes;
};

/**
 * Generic question props type so that custom components can be used without having to define a new type for each one.
 */
export type BaseQuestionProps<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers> & {
	type: string;
};

export type SelectableOption = {
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
};

export type DividerOption = { divider?: string };

export type Option = SelectableOption | DividerOption;

type Affix = {
	text: string;
	classes?: string;
};

interface InputField<Answers extends object = JourneyAnswers> {
	fieldName: string;
	label: string;
	formatJoinString?: string; // used by formatAnswerForSummary (e.g. task list display), effective default to line break
	formatPrefix?: string; // used by formatAnswerForSummary (e.g. task list display), to prefix answer
	formatTextFunction?: (text: string) => string; // used to format the answer for display and value in question
	formatSummaryValue?: (context: InputFieldSummaryContext<Answers>) => string; // used to format the answer for summary display only (not escaped)
	attributes?: Record<string, string>; // used to add HTML attributes to the field
	suffix?: Affix; // used to add a suffix to the field
	prefix?: Affix; // used to add a prefix to the field
	hint?: string;
	classes?: string;
	inputmode?: 'decimal' | 'numeric';
	pattern?: string; // Used for backwards-compatibility for older iOS devices in numeric input fields
}

/**
 * Context passed to InputField.formatSummaryValue
 * Extends the base SummaryFormatterContext with field-specific properties
 */
interface InputFieldSummaryContext<Answers extends object = JourneyAnswers> extends SummaryFormatterContext<
	unknown,
	Answers
> {
	/** The input field configuration */
	field: InputField<Answers>;
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
type OptionsQuestionParams<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers> & {
	options: Option[];
};

export type BooleanQuestionParams<Answers extends object = JourneyAnswers> = Omit<
	RadioQuestionParams<Answers>,
	'options'
> & {
	options?: Option[];
	interfaceType?: 'checkbox' | 'radio';
};

type BooleanQuestionProps<Answers extends object = JourneyAnswers> = BooleanQuestionParams<Answers> & {
	type: 'boolean';
};

export type CheckboxQuestionParams<Answers extends object = JourneyAnswers> = OptionsQuestionParams<Answers>;

type CheckboxQuestionProps<Answers extends object = JourneyAnswers> = CheckboxQuestionParams<Answers> & {
	type: 'checkbox';
};

export type DateQuestionParams<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers> & {
	dateFormat?: string;
};

type DateQuestionProps<Answers extends object = JourneyAnswers> = DateQuestionParams<Answers> & {
	type: 'date';
};

// Minute and second will default to 0 if not provided
interface TimeComponents {
	hour: number;
	minute?: number;
	second?: number;
}

export type DatePeriodQuestionParams<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers> & {
	dateFormat?: string;
	labels?: { start: string; end: string };
	hintStart?: string;
	hintEnd?: string;
	startTime?: TimeComponents;
	endTime?: TimeComponents;
};

type DatePeriodQuestionProps<Answers extends object = JourneyAnswers> = DatePeriodQuestionParams<Answers> & {
	type: 'date-period';
};

export type DateTimeQuestionParams<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers> & {
	dateFormat?: string;
	timeFormat?: string;
};

type DateTimeQuestionProps<Answers extends object = JourneyAnswers> = DateTimeQuestionParams<Answers> & {
	type: 'date-time';
};

export type ManageListQuestionParams<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers> & {
	titleSingular?: string;
	showManageListQuestions?: boolean;
	showAnswersInSummary?: boolean;
	confirmationQuestion?: string;
};

type ManageListQuestionProps<Answers extends object = JourneyAnswers> = ManageListQuestionParams<Answers> & {
	type: 'manage-list';
};

export type EmailQuestionParams<Answers extends object = JourneyAnswers> = SingleLineInputQuestionParams<Answers> & {
	autocomplete?: string; // autocomplete attribute value (defaults to 'email')
};

type EmailQuestionProps<Answers extends object = JourneyAnswers> = EmailQuestionParams<Answers> & {
	type: 'email';
};

export type MultiFieldInputQuestionParams<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers> & {
	inputFields: InputField<Answers>[];
};

export type MultiFieldInputQuestionProps<Answers extends object = JourneyAnswers> =
	MultiFieldInputQuestionParams<Answers> & {
		type: 'multi-field-input';
	};

export type NumberEntryQuestionParams<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers> & {
	suffix?: string;
	label?: string;
};

type NumberEntryQuestionProps<Answers extends object = JourneyAnswers> = NumberEntryQuestionParams<Answers> & {
	type: 'number';
};

export type RadioQuestionParams<Answers extends object = JourneyAnswers> = OptionsQuestionParams<Answers> & {
	viewFolder?: string;
	label?: string;
	legend?: string;
};

type RadioQuestionProps<Answers extends object = JourneyAnswers> = RadioQuestionParams<Answers> & {
	type: 'radio';
};

export type SelectQuestionParams<Answers extends object = JourneyAnswers> = OptionsQuestionParams<Answers> & {
	viewFolder?: string;
	disableAccessibleAutocomplete?: boolean;
	label?: string;
	legend?: string;
};

type SelectQuestionProps<Answers extends object = JourneyAnswers> = SelectQuestionParams<Answers> & {
	type: 'select';
};

export type SingleLineInputQuestionParams<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers> & {
	inputAttributes?: Record<string, string>; // HTML attributes to add to the input
	label?: string; // if defined this will show as a label for the input and the question will just be a standard h1
	classes?: string; // HTML classes to add to the input
};

type SingleLineInputQuestionProps<Answers extends object = JourneyAnswers> = SingleLineInputQuestionParams<Answers> & {
	type: 'single-line-input';
};

export type SiteAddressQuestionParams<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers>;

type SiteAddressQuestionProps<Answers extends object = JourneyAnswers> = SiteAddressQuestionParams<Answers> & {
	type: 'site-address';
};

type TextEntryCheckbox = {
	header: string;
	text: string;
	name: string;
	errorMessage?: string;
};

export type TextEntryQuestionParams<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers> & {
	textEntryCheckbox?: TextEntryCheckbox;
	label?: string; // if defined this will show as a label for the input and the question will just be a standard h1
};

type TextEntryQuestionProps<Answers extends object = JourneyAnswers> = TextEntryQuestionParams<Answers> & {
	type: 'text-entry';
};

export type TextEntryRedactQuestionParams<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers> & {
	textEntryCheckbox?: TextEntryCheckbox;
	label?: string; // if defined this will show as a label for the input and the question will just be a standard h1
	onlyShowRedactedValueForSummary?: boolean;
	useRedactedFieldNameForSave?: boolean;
	showSuggestionsUi?: boolean;
	summaryText?: string; // summaryText to use with the details component
	shouldTruncateSummary?: boolean; // determines whether redacted comment is truncated in summary view
};

type TextEntryRedactQuestionProps<Answers extends object = JourneyAnswers> = TextEntryRedactQuestionParams<Answers> & {
	type: 'text-entry-redact';
};

export type UnitOptionEntryQuestionParams<Answers extends object = JourneyAnswers> = CommonQuestionParams<Answers> & {
	conditionalFieldName: string; // will be the quantity and is captured by the conditional in the options
	options: UnitOption[];
	label?: string;
};

type UnitOptionEntryQuestionProps<Answers extends object = JourneyAnswers> = UnitOptionEntryQuestionParams<Answers> & {
	type: 'unit-option';
};

export type QuestionProps<Answers extends object = JourneyAnswers> =
	| BooleanQuestionProps<Answers>
	| CheckboxQuestionProps<Answers>
	| DateQuestionProps<Answers>
	| DatePeriodQuestionProps<Answers>
	| DateTimeQuestionProps<Answers>
	| ManageListQuestionProps<Answers>
	| EmailQuestionProps<Answers>
	| MultiFieldInputQuestionProps<Answers>
	| NumberEntryQuestionProps<Answers>
	| RadioQuestionProps<Answers>
	| SelectQuestionProps<Answers>
	| SingleLineInputQuestionProps<Answers>
	| SiteAddressQuestionProps<Answers>
	| TextEntryQuestionProps<Answers>
	| TextEntryRedactQuestionProps<Answers>
	| UnitOptionEntryQuestionProps<Answers>;
