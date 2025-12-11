/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} pageCaption
 * @param {object} viewData
 */
export function list(req: any, res: any, pageCaption: string, viewData: object): Promise<any>;
/**
 * @type {import('express').Handler}
 */
export function question(req: any, res: any): Promise<any>;
/**
 * @typedef {Object} SaveParams
 * @property {import('express').Request} req
 * @property {import('express').Response} res
 * @property {string} journeyId
 * @property {string} referenceId
 * @property {Object<string, any>} data
 */
/**
 * @typedef {(params: SaveParams) => Promise<void>} SaveDataFn
 */
/**
 * @param {SaveDataFn} saveData
 * @param {boolean} [redirectToTaskListOnSuccess] - optionally redirect to the task list after save instead of next question
 * @returns {import('express').Handler}
 */
export function buildSave(saveData: SaveDataFn, redirectToTaskListOnSuccess?: boolean): any;
type SectionView = {
	heading: string;
	status: string;
	list: {
		rows: Array<RowView>;
	};
};
export type RowView = {
	key: {
		text: string;
	};
	value:
		| {
				text: string;
		  }
		| {
				html: string;
		  };
	actions?: {
		items: ActionView[];
	};
};
export type ActionView = {
	href: string;
	text: string;
	visuallyHiddenText?: string;
};
export type SaveParams = {
	req: any;
	res: any;
	journeyId: string;
	referenceId: string;
	data: {
		[x: string]: any;
	};
};
export type SaveDataFn = (params: SaveParams) => Promise<void>;
