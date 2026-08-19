import type { RouteParams } from './journey-types.d.ts';
import type ManageListQuestion from '#src/components/manage-list/question.js';
import type BaseValidator from '#src/validator/base-validator.js';
import type { JourneyResponse } from '#src/journey/journey-response.js';

/**
 * Context passed to the custom summary formatter
 */
export interface SummaryFormatterContext<TAnswer = unknown> {
	/** The raw answer value */
	answer: TAnswer;
	/** The default display value */
	formattedAnswer: string;
	/** The question instance */
	question: import('./question.js').Question;
	/** The journey instance */
	journey: import('../journey/journey.js').Journey;
	/** The section segment */
	sectionSegment: string;
	/** The selected option objects (for options-based questions) */
	selectedOptions?: import('./options-question.js').Option[];
}

/**
 * Custom function to format the summary display value
 */
export type SummaryValueFormatter<TAnswer = unknown> = (context: SummaryFormatterContext<TAnswer>) => string;

export interface QuestionParameters {
	title: string;
	question: string;
	viewFolder: string;
	fieldName: string;
	url?: string;
	pageTitle?: string;
	description?: string;
	validators?: BaseValidator[];
	html?: string;
	hint?: string;
	interfaceType?: string;
	shouldDisplay?: (response: JourneyResponse) => boolean;
	autocomplete?: string;
	// is this question editable? defaults to true
	editable?: boolean;
	// override the action link for this question
	actionLink?: ActionLink;
	// custom function to format the summary display value
	formatSummaryValue?: SummaryValueFormatter;
	// whether to capitalise the first letter of the answer in summary (defaults to true)
	capitaliseAnswer?: boolean;
	// static view data for this question
	viewData?: {
		/**
		 * @deprecated replaced by secondaryActions
		 */
		extraActionButtons?: SecondaryAction[];
		/**
		 * Secondary action buttons
		 */
		secondaryActions?: SecondaryAction[];
		[key: string]: any;
	};
}

export interface ActionLink {
	text: string;
	href: string;
}

export type SecondaryAction = SecondaryActionButton | SecondaryActionLink;

export interface SecondaryActionButton {
	text: string;
	type?: string;
	formaction?: string;
	classes?: string;
}

export interface SecondaryActionLink {
	text: string;
	href: string;
	classes?: string;
}

interface BaseQuestionViewData {
	value: unknown;
	question: string;
	fieldName: string;
	pageTitle: string;
	description?: string;
	html?: string;
	hint?: string;
	interfaceType?: string;
	autocomplete?: string;
}

export interface QuestionViewModel<TQuestionViewData extends BaseQuestionViewData = BaseQuestionViewData> {
	question: TQuestionViewData;
	answer: unknown;
	layoutTemplate: string;
	pageCaption?: string;
	continueButtonText: string;
	backLink?: string;
	showBackToListLink: boolean;
	listLink: string;
	journeyTitle: string;
	payload?: unknown;
	util: {
		trimTrailingSlash: (str: string) => string;
	};
	[key: string]: unknown;
}

export interface PrepQuestionForRenderingOptions {
	params: RouteParams;
	manageListQuestion?: ManageListQuestion;
}

/**
 * Define a question class type so that projects downstream can extend the
 * Question class and still pass them to the createQuestions function.
 */
export type QuestionClass<TQuestion extends Question = Question> = new (...args: never[]) => TQuestion;

/**
 * Action link displayed in summary lists
 */
export interface ActionView {
	href: string;
	text: string;
	visuallyHiddenText?: string;
}

/**
 * A row in a summary list, returned by formatAnswerForSummary
 */
export interface SummaryRow {
	key: string;
	value: string;
	action?: ActionView | ActionView[];
}
