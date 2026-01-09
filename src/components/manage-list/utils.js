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

/**
 * Similar to answerObjectForManageList but will edit response and add a new array entry if not found
 *
 * @param {import('#src/journey/journey-response.js').JourneyResponse} response
 * @param {import('./question.js')} manageListQuestion
 * @param {import('#src/journey/journey-types.d.ts').RouteParams} params
 * @returns {import('#src/journey/journey-types.d.ts').ManageListAnswers}
 */
export function answerObjectForManageListSaving(response, manageListQuestion, params) {
	const answersList =
		response.answers[manageListQuestion?.fieldName] || (response.answers[manageListQuestion?.fieldName] = []);
	let answers = answersList.find((item) => item.id === params.manageListItemId);
	if (!answers) {
		answers = {
			id: params.manageListItemId
		};
		answersList.push(answers);
	}
	return answers;
}
