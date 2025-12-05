/** @typedef {import('../../journey/journey-response').JourneyResponse} JourneyResponse */
/** @typedef {import('../../questions/question').Question} Question */
/** @type {(response: JourneyResponse) => {and: (questionKeyTuples: [any, unknown][]) => boolean, or: (questionKeyTuples: [any, unknown][]) => boolean}} */
export const logicalCombinations: (response: JourneyResponse) => {
    and: (questionKeyTuples: [any, unknown][]) => boolean;
    or: (questionKeyTuples: [any, unknown][]) => boolean;
};
/** @type {(response: JourneyResponse, question: any, expectedValue: unknown) => boolean} */
export const questionHasAnswer: (response: JourneyResponse, question: any, expectedValue: unknown) => boolean;
export function questionArrayMeetsCondition(response: JourneyResponse, question: any, conditionFn?: (item: any) => boolean): boolean;
/** @type {(response: JourneyResponse, questionKeyTuples: [any, unknown][], options?: {logicalCombinator: 'and' | 'or'}) => boolean} */
export const questionsHaveAnswers: (response: JourneyResponse, questionKeyTuples: [any, unknown][], options?: {
    logicalCombinator: "and" | "or";
}) => boolean;
/** @type {(response: JourneyResponse, question: any) => boolean} */
export const questionHasNonEmptyStringAnswer: (response: JourneyResponse, question: any) => boolean;
/** @type {(response: JourneyResponse, question: any) => boolean} */
export const questionHasNonEmptyNumberAnswer: (response: JourneyResponse, question: any) => boolean;
export type JourneyResponse = import("../../journey/journey-response").JourneyResponse;
type Question = import("../../questions/question").Question;
