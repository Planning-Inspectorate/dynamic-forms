export function logicalCombinations(response: any): {
	and: CombinationFunc;
	or: CombinationFunc;
};
export function whenQuestionHasAnswer(question: any, expectedValue: unknown): any;
export function questionHasAnswer(
	response: any,
	question:
		| any
		| {
				optionJoinString: string;
		  },
	expectedValue: unknown
): boolean;
export function questionArrayMeetsCondition(
	response: JourneyResponse,
	question: any,
	conditionFn?: (item: any) => boolean
): boolean;
export function questionsHaveAnswers(
	response: any,
	questionKeyTuples: QuestionKeyTuples,
	{
		logicalCombinator
	}?: {
		logicalCombinator: 'and' | 'or';
	}
): boolean;
export function questionHasNonEmptyStringAnswer(response: any, question: any): boolean;
export function questionHasNonEmptyNumberAnswer(response: any, question: any): boolean;
export type QuestionKeyTuples = [any, unknown][];
export type CombinationFunc = (questionKeyTuples: QuestionKeyTuples) => boolean;
