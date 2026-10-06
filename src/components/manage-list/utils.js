/**
 * @template {object} [Answers=import('#typedefs/journey-types.d.ts').JourneyAnswers]
 * @template {object} [ItemAnswers=import('#typedefs/journey-types.d.ts').ManageListAnswers]
 * @param {import('#typedefs/journey-types.d.ts').JourneyResponseLike<Answers>} response
 * @param {import('./question.js').ManageListQuestion<Answers, ItemAnswers>} manageListQuestion
 * @param {string} manageListItemId
 * @returns {Partial<ItemAnswers>}
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
 * @template {object} [Answers=import('#typedefs/journey-types.d.ts').JourneyAnswers]
 * @template {object} [ItemAnswers=import('#typedefs/journey-types.d.ts').ManageListAnswers]
 * @param {import('#typedefs/journey-types.d.ts').JourneyResponseLike<Answers>} response
 * @param {import('./question.js').ManageListQuestion<Answers, ItemAnswers>} manageListQuestion
 * @param {import('#typedefs/journey-types.d.ts').RouteParams} params
 * @returns {import('#typedefs/journey-types.d.ts').ManageListAnswers}
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
