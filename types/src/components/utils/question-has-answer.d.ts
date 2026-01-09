export function logicalCombinations(response: import('#src/journey/journey-response.js').JourneyResponse): {
	and: CombinationFunc;
	or: CombinationFunc;
};
export function whenQuestionHasAnswer(
	question: import('#question').Question,
	expectedValue: unknown
): import('#src/section.js').QuestionCondition;
export function questionHasAnswer(
	response: import('#src/journey/journey-response.js').JourneyResponse,
	question:
		| import('#question').Question
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
	response: import('#src/journey/journey-response.js').JourneyResponse,
	questionKeyTuples: QuestionKeyTuples,
	{
		logicalCombinator
	}?: {
		logicalCombinator: 'and' | 'or';
	}
): boolean;
export function questionHasNonEmptyStringAnswer(
	response: import('#src/journey/journey-response.js').JourneyResponse,
	question: import('#question').Question
): boolean;
export function questionHasNonEmptyNumberAnswer(
	response: import('#src/journey/journey-response.js').JourneyResponse,
	question: import('#question').Question
): boolean;
export type QuestionKeyTuples = [any, unknown][];
export type CombinationFunc = (questionKeyTuples: QuestionKeyTuples) => boolean;
