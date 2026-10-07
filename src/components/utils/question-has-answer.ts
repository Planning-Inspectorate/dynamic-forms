import type { JourneyResponse } from '#src/journey/journey-response.ts';
import type { Question, QuestionCondition } from '#src/questions/question.ts';

export type QuestionKeyTuples = [any, unknown][];
export type CombinationFunc = (questionKeyTuples: QuestionKeyTuples) => boolean;
export type ConditionFunc = (item: unknown) => boolean;

export const logicalCombinations = (response: JourneyResponse): { and: CombinationFunc; or: CombinationFunc } => ({
	and: (questionKeyTuples: QuestionKeyTuples) =>
		questionKeyTuples.every((questionKeyTuple) => questionHasAnswer(response, ...questionKeyTuple)),
	or: (questionKeyTuples: QuestionKeyTuples) =>
		questionKeyTuples.some((questionKeyTuple) => questionHasAnswer(response, ...questionKeyTuple))
});

/**
 * A wrapper around questionHasAnswer to use as a condition directly
 *
 * @example
 * .withCondition(whenQuestionHasAnswer(question.q1, 'answer-1'))
 */
export const whenQuestionHasAnswer = (question: Question, expectedValue: unknown): QuestionCondition => {
	return (response) => questionHasAnswer(response, question, expectedValue);
};

/**
 * Does the question have the expected answer?
 */
export const questionHasAnswer = (
	response: JourneyResponse,
	question: Question & { optionJoinString?: string },
	expectedValue: unknown
) => {
	if (!response.answers) return false;
	const answerField = response.answers[question.fieldName];

	if (Array.isArray(answerField)) {
		return answerField.includes(expectedValue);
	} else if (question.optionJoinString && typeof answerField === 'string') {
		// todo: DF-51 answers from options questions sometimes are array sometimes string, why?
		if (!answerField) return false;
		const answers = answerField.split(question.optionJoinString);
		return answers.includes(expectedValue as string);
	} else {
		return answerField === expectedValue;
	}
};

/**
 * Checks if any item in the specified answer field matches a condition.
 */
export const questionArrayMeetsCondition = (
	response: JourneyResponse,
	question: Question,
	conditionFn: ConditionFunc = () => false
) => {
	if (!response.answers) return false;
	const answerField = response.answers[question.fieldName];

	if (Array.isArray(answerField) && answerField.length > 0) {
		return answerField.some(conditionFn);
	}

	return false;
};

export const questionsHaveAnswers = (
	response: JourneyResponse,
	questionKeyTuples: QuestionKeyTuples,
	{ logicalCombinator }: { logicalCombinator: 'and' | 'or' } = { logicalCombinator: 'and' }
) => {
	const combinators = logicalCombinations(response);

	return combinators[logicalCombinator](questionKeyTuples);
};

export const questionHasNonEmptyStringAnswer = (response: JourneyResponse, question: Question) => {
	if (!response.answers) return false;
	const answerField = response.answers[question.fieldName];
	return typeof answerField === 'string' && answerField.trim().length > 0;
};

export const questionHasNonEmptyNumberAnswer = (response: JourneyResponse, question: Question) => {
	if (!response.answers) return false;
	const answerField = response.answers[question.fieldName];
	return typeof answerField === 'number' && !isNaN(answerField);
};
