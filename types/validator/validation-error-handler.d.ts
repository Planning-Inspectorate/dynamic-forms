/**
 * @typedef {{text: string, href: string}[]} GovUkErrorList
 * @typedef {Object<string, import('express-validator').ValidationError>} ExpressValidationErrors
 * @typedef {(errors: ExpressValidationErrors) => GovUkErrorList} ToErrorSummary
 */
/**
 * @type {ToErrorSummary}
 */
export const expressValidationErrorsToGovUkErrorList: ToErrorSummary;
export function buildValidationErrorHandler(
	validate?: import('express-validator').ResultFactory<import('express-validator').ValidationError>,
	toErrorSummary?: ToErrorSummary
): any;
export const validationErrorHandler: any;
export type GovUkErrorList = {
	text: string;
	href: string;
}[];
export type ExpressValidationErrors = {
	[x: string]: import('express-validator').ValidationError;
};
export type ToErrorSummary = (errors: ExpressValidationErrors) => GovUkErrorList;
