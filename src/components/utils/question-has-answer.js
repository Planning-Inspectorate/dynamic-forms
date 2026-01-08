/** @typedef {[any, unknown][]} QuestionKeyTuples */
/** @typedef {(questionKeyTuples: QuestionKeyTuples) => boolean} CombinationFunc */

/**
 * @param {import('#src/journey/journey-response.js').JourneyResponse} response
 * @returns {{and: CombinationFunc, or: CombinationFunc}}
 */
export const logicalCombinations = (response) => ({
	and: (questionKeyTuples) =>
		questionKeyTuples.every((questionKeyTuple) => questionHasAnswer(response, ...questionKeyTuple)),
	or: (questionKeyTuples) =>
		questionKeyTuples.some((questionKeyTuple) => questionHasAnswer(response, ...questionKeyTuple))
});

/**
 * Does the question have the expected answer?
 *
 * @param {import('#src/journey/journey-response.js').JourneyResponse} response
 * @param {import('#question').Question} question
 * @param {unknown} expectedValue
 * @returns {boolean}
 */
export const questionHasAnswer = (response, question, expectedValue) => {
	if (!response.answers) return false;
	return questionHasAnswerImpl(response.answers, question, expectedValue);
};

/**
 * Returns true if the given question has the given answer
 *
 * @param {Record<string, unknown>} answers
 * @param {import('#question').Question|{optionJoinString: string}} question
 * @param {any} expectedValue
 * @returns {boolean}
 */
const questionHasAnswerImpl = (answers, question, expectedValue) => {
	if (!answers) return false;
	const answerField = answers[question.fieldName];

	if (Array.isArray(answerField)) {
		return answerField.includes(expectedValue);
	} else if (question.optionJoinString && typeof answerField === 'string') {
		// todo: answers from options questions sometimes are array sometimes string, why?
		if (!answerField) return false;
		const answers = answerField.split(question.optionJoinString);
		return answers.includes(expectedValue);
	} else {
		return answerField === expectedValue;
	}
};

/**
 * Checks if any item in the specified answer field matches a condition.
 *
 * @param {JourneyResponse} response - The response object containing answers.
 * @param {any} question - The question containing the fieldName.
 * @param {(item: any) => boolean} [conditionFn] - A function to test each item. Returns true to indicate a match.
 * @returns {boolean} True if at least one item matches the condition.
 */
export const questionArrayMeetsCondition = (response, question, conditionFn = () => false) => {
	if (!response.answers) return false;
	const answerField = response.answers[question.fieldName];

	if (Array.isArray(answerField) && answerField.length > 0) {
		return answerField.some(conditionFn);
	}

	return false;
};

/**
 * @param {import('#src/journey/journey-response.js').JourneyResponse} response
 * @param {QuestionKeyTuples} questionKeyTuples
 * @param {Object} [options]
 * @param {'and' | 'or'} options.logicalCombinator
 * @returns {boolean}
 */
export const questionsHaveAnswers = (
	response,
	questionKeyTuples,
	{ logicalCombinator } = { logicalCombinator: 'and' }
) => {
	const combinators = logicalCombinations(response);

	return combinators[logicalCombinator](questionKeyTuples);
};

/**
 * @param {import('#src/journey/journey-response.js').JourneyResponse} response
 * @param {import('#question').Question} question
 * @returns {boolean}
 */
export const questionHasNonEmptyStringAnswer = (response, question) => {
	if (!response.answers) return false;
	const answerField = response.answers[question.fieldName];
	return typeof answerField === 'string' && answerField.trim().length > 0;
};

/**
 * @param {import('#src/journey/journey-response.js').JourneyResponse} response
 * @param {import('#question').Question} question
 * @returns {boolean}
 */
export const questionHasNonEmptyNumberAnswer = (response, question) => {
	if (!response.answers) return false;
	const answerField = response.answers[question.fieldName];
	return typeof answerField === 'number' && !isNaN(answerField);
};
