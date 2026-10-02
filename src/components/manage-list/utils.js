/**
 *
 * @param {import('../../journey/journey-response.js').JourneyResponse} response
 * @param {{fieldName: string}} withFieldName
 * @param {string} itemId
 * @returns {Record<string, unknown>}
 */
export function answerObjectForListItem(response, withFieldName, itemId) {
	const answers = response.answers[withFieldName.fieldName];
	if (!Array.isArray(answers)) {
		return {};
	}
	return answers.find((a) => a.id === itemId) || {};
}

/**
 * Similar to answerObjectForListItem but will edit response and add a new array entry if not found
 *
 * @param {import('../../journey/journey-response.js').JourneyResponse} response
 * @param {{fieldName: string}} withFieldName
 * @param {string} itemId
 * @returns {import('#typedefs/journey-types.d.ts').ManageListAnswers}
 */
export function answerObjectForListItemSaving(response, withFieldName, itemId) {
	const answersList = response.answers[withFieldName?.fieldName] || (response.answers[withFieldName?.fieldName] = []);
	let answers = answersList.find((item) => item.id === itemId);
	if (!answers) {
		answers = {
			id: itemId
		};
		answersList.push(answers);
	}
	return answers;
}
