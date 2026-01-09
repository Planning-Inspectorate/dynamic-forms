/**
 * @param {object} [viewData]
 * @returns {import('express').Handler}
 */
export function buildList(viewData?: object): any;
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} pageCaption
 * @param {object} viewData
 */
export function list(req: any, res: any, pageCaption: string, viewData: object): Promise<any>;
/**
 * Render an individual question
 *
 * @type {import('express').Handler}
 */
export function question(req: any, res: any): Promise<any>;
/**
 * @typedef {Object} SaveParams
 * @property {import('express').Request} req
 * @property {import('express').Response} res
 * @property {string} journeyId
 * @property {string} referenceId
 * @property {boolean} isManageListItem
 * @property {string} [manageListQuestionFieldName]
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
export type Journey = import('./journey/journey.js').Journey;
export type Question = import('./questions/question.js').Question;
export type Section = any;
export type SectionView = {
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
	actions?:
		| {
				items: ActionView[];
		  }
		| undefined;
};
export type ActionView = {
	href: string;
	text: string;
	visuallyHiddenText?: string | undefined;
};
export type SaveParams = {
	req: any;
	res: any;
	journeyId: string;
	referenceId: string;
	isManageListItem: boolean;
	manageListQuestionFieldName?: string | undefined;
	data: {
		[x: string]: any;
	};
};
export type SaveDataFn = (params: SaveParams) => Promise<void>;
