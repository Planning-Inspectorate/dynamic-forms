import { JourneyResponse } from '../journey/journey-response.ts';
import { booleanToYesNoValue } from '../components/boolean/question.ts';
import type { SaveDataFn } from '../controller.ts';
import type { JourneyAnswers, ManageListAnswers } from '../types/journey-types.ts';
import type { Request, Handler } from 'express';

type RequestWithSession = Request & {
	session?: {
		forms?: Record<string, JourneyAnswers>;
	};
	sessionID: string;
};

// functions for saving answers to the session

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
 * Delete behavior for manage-list items:
 * - When `manageListItemRemove === true`, and both `manageListQuestionFieldName` and `req.params.manageListItemId`
 *   are present, the item with a matching `id` is removed from the array stored at `answers[manageListQuestionFieldName]`.
 * - If the list does not exist or is not an array, no action is taken.
 */
export function buildSaveDataToSession({ reqParam }: { reqParam?: string } = {}): SaveDataFn {
	return async ({
		req,
		journeyId,
		data,
		isManageListItem,
		manageListQuestionFieldName,
		manageListItemRemove = false,
		isDynamicSection,
		dynamicSectionFieldName,
		dynamicSectionId
	}) => {
		const reqWithSession = req as RequestWithSession;
		if (!reqWithSession.session) {
			throw new Error('request session required');
		}
		let forms = reqWithSession.session.forms || (reqWithSession.session.forms = {});
		if (reqParam) {
			const reqParamValue = req.params[reqParam] as string;
			// key by a further param
			forms = (forms[reqParamValue] || (forms[reqParamValue] = {})) as Record<string, JourneyAnswers>;
		}
		let answers = forms[journeyId] || (forms[journeyId] = {} as JourneyAnswers);

		if (isManageListItem || isDynamicSection) {
			// manage list and dynamic sections can be handled the same, just with different properties
			// for the fieldName and item id
			const fieldName = isManageListItem ? manageListQuestionFieldName! : dynamicSectionFieldName!;
			const itemId = isManageListItem ? req.params.manageListItemId : dynamicSectionId;

			const answersList = (answers[fieldName] as ManageListAnswers[]) || (answers[fieldName] = []);
			const manageListAnswers = answersList.find((item) => item.id === itemId);

			if (manageListAnswers) {
				answers = manageListAnswers;
			} else {
				answers = { id: itemId }; // answers object to manipulate and add other answers to
				answersList.push(answers as ManageListAnswers); //add the answers object to the array
			}
		} else if (manageListItemRemove && manageListQuestionFieldName && req.params.manageListItemId) {
			const answersList = answers[manageListQuestionFieldName];

			if (!answersList || !Array.isArray(answersList)) return; // nothing to remove

			const index = answersList.findIndex((item) => item.id === req.params.manageListItemId);
			if (index > -1) {
				answersList.splice(index, 1);
				return;
			}
			return; // item not found, nothing to remove
		}
		for (const [k, v] of Object.entries(data?.answers || {})) {
			answers[k] = v;
		}
	};
}

/**
 * Default save-to-session function with no request parameter
 */
export const saveDataToSession = buildSaveDataToSession();

export interface ClearDataParams {
	req: RequestWithSession;
	journeyId: string;
	/** optional data to replace the form answers with */
	replaceWith?: Record<string, unknown>;
	/** optional request parameter used as a key */
	reqParam?: string;
}

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
 */
export function clearDataFromSession({ req, journeyId, replaceWith, reqParam }: ClearDataParams) {
	if (!req.session) {
		return; // no need to error, no action
	}
	let forms = req.session.forms || (req.session.forms = {});
	if (reqParam) {
		const reqParamValue = req.params[reqParam] as string;
		// key by a further param
		forms = (forms[reqParamValue] || (forms[reqParamValue] = {})) as Record<string, JourneyAnswers>;
	}
	if (replaceWith) {
		forms[journeyId] = replaceWith;
	} else {
		delete forms[journeyId];
	}
}

/**
 * Fetch session answers from the session
 */
export function buildGetJourneyResponseFromSession(journeyId: string, reqParam?: string): Handler {
	return (req, res, next) => {
		const reqWithSession = req as RequestWithSession;
		if (!reqWithSession.session) {
			throw new Error('request session required');
		}
		let answers: JourneyAnswers = {};

		let forms = reqWithSession.session?.forms;
		if (reqParam) {
			const reqParamValue = req.params[reqParam] as string;
			forms = (forms && forms[reqParamValue]) as Record<string, JourneyAnswers>;
		}
		if (forms && journeyId in forms) {
			answers = { ...forms[journeyId] } as JourneyAnswers; // work with a copy, we don't want to edit session values
		}
		for (const [k, v] of Object.entries(answers)) {
			if (typeof v === 'boolean') {
				answers[k] = booleanToYesNoValue(v);
			}
		}
		res.locals.journeyResponse = new JourneyResponse(journeyId, reqWithSession.sessionID, answers);
		next();
	};
}
