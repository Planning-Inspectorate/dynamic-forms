import BaseValidator from '../validator/base-validator';
import { JourneyResponse } from '../journey/journey-response';

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
	//enables a more descriptive view of the question
	descriptive?: { title: string; paragraphs: string[] };
}

export interface ActionLink {
	text: string;
	href: string;
}
