import type { JourneyResponse } from '../journey/journey-response.ts';
import type { ManageListAnswers } from '../types/journey-types.ts';

export type WithFieldName = {
	fieldName: string;
};

export function answerObjectForListItem(
	response: JourneyResponse,
	withFieldName: WithFieldName,
	itemId: string
): Record<string, unknown> {
	const answers = response.answers[withFieldName.fieldName];
	if (!Array.isArray(answers)) {
		return {};
	}
	return answers.find((a) => a.id === itemId) || {};
}

/**
 * Similar to answerObjectForListItem but will edit response and add a new array entry if not found
 */
export function answerObjectForListItemSaving(
	response: JourneyResponse,
	withFieldName: WithFieldName,
	itemId: string
): ManageListAnswers {
	const answersList =
		(response.answers[withFieldName?.fieldName] as ManageListAnswers[]) ||
		(response.answers[withFieldName?.fieldName] = []);
	let answers = answersList.find((item) => item.id === itemId);
	if (!answers) {
		answers = {
			id: itemId
		};
		answersList.push(answers);
	}
	return answers;
}
