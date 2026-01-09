/**
 *
 * @param {import('#src/journey/journey-response.js').JourneyResponse} response
 * @param {import('./question.js')} manageListQuestion
 * @param {string} manageListItemId
 * @returns {Record<string, unknown>}
 */
export function answerObjectForManageList(
	response: import('#src/journey/journey-response.js').JourneyResponse,
	manageListQuestion: typeof import('./question.js'),
	manageListItemId: string
): Record<string, unknown>;
/**
 * Similar to answerObjectForManageList but will edit response and add a new array entry if not found
 *
 * @param {import('#src/journey/journey-response.js').JourneyResponse} response
 * @param {import('./question.js')} manageListQuestion
 * @param {import('#src/journey/journey-types.d.ts').RouteParams} params
 * @returns {import('#src/journey/journey-types.d.ts').ManageListAnswers}
 */
export function answerObjectForManageListSaving(
	response: import('#src/journey/journey-response.js').JourneyResponse,
	manageListQuestion: typeof import('./question.js'),
	params: import('#src/journey/journey-types.d.ts').RouteParams
): import('#src/journey/journey-types.d.ts').ManageListAnswers;
