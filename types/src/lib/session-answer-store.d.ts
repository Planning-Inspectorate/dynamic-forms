/**
 * A `SaveDataFn` implementation that saves answers to the session.
 * Answers are saved into a forms object, keyed by the journeyId, and optionally by a request parameter
 * @example
 * req: {
 * 	session: {
 * 		forms: {
 * 			'journey-id-1': {
 * 				questionOne: 'my answer'
 * 				// ...
 * 			}
 * 		}
 * 	}
 * }
 *
 * or when keyed by a req parameter:
 * @example
 * req: {
 * 	session: {
 * 		forms: {
 * 			'some-req-param': {
 * 			   'journey-id-1': {
 * 				   questionOne: 'my answer'
 * 				   // ...
 * 			   }
 * 			}
 * 		}
 * 	}
 * }
 *
 *
 * @param {Object} opts
 * @param {string} [opts.reqParam] - optional request parameter to use as a key
 * @returns {import('../controller').SaveDataFn}
 */
export function buildSaveDataToSession({ reqParam }?: { reqParam?: string }): import('../controller').SaveDataFn;
/**
 * A function to clear journey answers from the session
 *
 * @example
 * req: {
 * 	session: {
 * 		forms: {
 * 			'journey-id-1': {
 * 				questionOne: 'my answer'
 * 				// ...
 * 			}
 * 		}
 * 	}
 * }
 *
 * @param {Object} params
 * @param {import('express').Request} params.req
 * @param {string} params.journeyId
 * @param {Object<string, any>} [params.replaceWith] - optional data to replace the form answers with
 * @param {string} [params.reqParam] - optional request parameter used as a key
 * @returns {void}
 */
export function clearDataFromSession({
	req,
	journeyId,
	replaceWith,
	reqParam
}: {
	req: any;
	journeyId: string;
	replaceWith?: {
		[x: string]: any;
	};
	reqParam?: string;
}): void;
/**
 * Fetch session answers from the session
 *
 * @param {string} journeyId
 * @param {string} [reqParam] - optional request parameter used as a key
 * @returns {import('express').Handler}
 */
export function buildGetJourneyResponseFromSession(journeyId: string, reqParam?: string): any;
/**
 * Default save-to-session function with no request parameter
 *
 * @type {import('../controller').SaveDataFn}
 */
export const saveDataToSession: import('../controller').SaveDataFn;
