/**
 *
 * @param {import('#src/journey/journey-response.js').JourneyResponse} response
 * @param {import('./question.js')} manageListQuestion
 * @param {string} manageListItemId
 * @returns {Record<string, unknown>}
 */
export function answerObjectForManageList(response, manageListQuestion, manageListItemId) {
	const answers = response.answers[manageListQuestion.fieldName];
	if (!Array.isArray(answers)) {
		return {};
	}
	return answers.find((a) => a.id === manageListItemId) || {};
}
