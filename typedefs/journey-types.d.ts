/**
 * Express route parameters used for journey routes
 */
export type RouteParams = CoreRouteParams & ManageListRouteParams;

export type CoreRouteParams = {
	section: string;
	question: string;
	[key: string]: string;
};

export type ManageListRouteParams =
	| {
			manageListAction: string;
			manageListItemId: string;
			manageListQuestion: string;
	  }
	| {};

export interface JourneyAnswers {
	// if the answer is for a manage list question, the answer will be an array of answer objects
	[k: string]: unknown | ManageListAnswers[];
}

export interface ManageListAnswers {
	id: string;
	[k: string]: unknown;
}
