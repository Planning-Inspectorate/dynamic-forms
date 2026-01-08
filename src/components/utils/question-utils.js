export function getConditionalFieldName(parentField, conditionalField) {
	return `${parentField}_${conditionalField}`;
}

export function getConditionalAnswer(answers, question, answer) {
	const conditionalFieldName = question.options?.find((option) => option.value === answer)?.conditional?.fieldName;
	return conditionalFieldName ? answers[getConditionalFieldName(question.fieldName, conditionalFieldName)] : null;
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
