export function getConditionalFieldName(parentField, conditionalField) {
	return `${parentField}_${conditionalField}`;
}

/**
 * Get conditional answer(s) for a question.
 * Returns an object keyed by option value with conditional answers, or null if no conditionals exist.
 *
 * @param {Record<string, unknown>} answers - all answers
 * @param {{options?: Array<{value: string, conditional?: {fieldName: string}}>, fieldName: string, optionJoinString?: string}} question - question with options
 * @param {string} answer - the answer value (may be separated by optionJoinString for checkboxes)
 * @returns {Record<string, string> | null} conditional answer(s) keyed by option value
 */
export function getConditionalAnswer(answers, question, answer) {
	if (!answer || !question.options) {
		return null;
	}

	// TODO DF-51 treat as an array
	const joinString = question.optionJoinString || ',';
	const answerValues = String(answer)
		.split(joinString)
		.map((v) => v.trim());

	const conditionals = {};
	for (const value of answerValues) {
		const option = question.options.find((opt) => opt.value === value);
		if (!option?.conditional?.fieldName) {
			continue;
		}
		const conditionalValue = answers[getConditionalFieldName(question.fieldName, option.conditional.fieldName)];
		if (conditionalValue) {
			conditionals[value] = conditionalValue;
		}
	}
	return Object.keys(conditionals).length > 0 ? conditionals : null;
}

/**
 * @param {unknown} conditional
 * @returns {conditional is {html: string}}
 */
export function conditionalIsJustHTML(conditional) {
	return !!conditional && Object.hasOwn(conditional, 'html') && Object.keys(conditional).length === 1;
}

export default {
	getConditionalAnswer,
	getConditionalFieldName
};
