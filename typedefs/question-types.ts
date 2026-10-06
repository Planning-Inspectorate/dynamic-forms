import type { RouteParams } from './journey-types.d.ts';
import type ManageListQuestion from '#src/components/manage-list/question.ts';
import type BaseValidator from '#src/validator/base-validator.ts';
import type { JourneyResponse } from '#src/journey/journey-response.ts';
import type { SummaryValueFormatter } from './question-props.d.ts';
import type { Question } from '#src/questions/question.ts';
import type { trimTrailingSlash } from '#src/lib/utils.ts';

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

export interface BaseQuestionViewData {
	value: unknown;
	question: string;
	fieldName: string;
	pageTitle: string;
	description?: string;
	html?: string;
	hint?: string;
	interfaceType?: string;
	autocomplete?: string;
	[key: string]: unknown;
}

export interface QuestionViewModel<TQuestionViewData extends BaseQuestionViewData = BaseQuestionViewData> {
	question: TQuestionViewData;
	answer: unknown;
	layoutTemplate: string;
	pageCaption?: string;
	continueButtonText: string;
	backLink?: string | null;
	showBackToListLink: boolean;
	listLink: string;
	journeyTitle: string;
	payload?: unknown;
	util: {
		trimTrailingSlash: typeof trimTrailingSlash;
	};
	[key: string]: unknown;
}

export interface PrepQuestionForRenderingOptions {
	params: RouteParams;
	manageListQuestion?: ManageListQuestion;
	dynamicSection?: {
		fieldName: string;
	};
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
