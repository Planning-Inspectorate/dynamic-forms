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
