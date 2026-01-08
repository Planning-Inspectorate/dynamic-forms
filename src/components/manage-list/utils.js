/**
 *
 * @param {import('#src/journey/journey-response.js').JourneyResponse} response
 * @param {import('./question.js')} manageListQuestion
 * @param {import('#src/journey/journey-types.d.ts').RouteParams} params
 * @returns {Record<string, unknown>}
 */
export function answerObjectForManageList(response, manageListQuestion, params) {
	const answers = response.answers[manageListQuestion.fieldName];
	if (!Array.isArray(answers)) {
		return {};
	}
	const itemId = params.manageListItemId;
	return answers.find((a) => a.id === itemId) || {};
}
