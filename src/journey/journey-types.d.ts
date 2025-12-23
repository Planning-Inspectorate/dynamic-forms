/**
 * Express route parameters used for journey routes
 */
export type RouteParams = {
	section: string;
	question: string;
	[key: string]: string;
};
