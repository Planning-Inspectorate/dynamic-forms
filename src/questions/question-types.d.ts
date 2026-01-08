import BaseValidator from '../validator/base-validator';
import { JourneyResponse } from '../journey/journey-response';
import { RouteParams } from '#src/journey/journey-types.d.ts';
import ManageListQuestion from '#src/components/manage-list/question.js';

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
	// static view data for this question
	viewData?: Object<string, any>;
}

export interface ActionLink {
	text: string;
	href: string;
}

export interface QuestionViewModel {
	question: {
		value: string | number | Record<string, any>;
		question: string;
		fieldName: string;
		pageTitle: string;
		description?: string;
		html?: string;
	};
	layoutTemplate: string;
	pageCaption: string;
	continueButtonText: string;
	backLink: string;
	showBackToListLink: string;
	listLink: string;
	journeyTitle: string;
	[k: string]: any;
}

export interface PrepQuestionForRenderingOptions {
	params: RouteParams;
	manageListQuestion?: ManageListQuestion;
}
