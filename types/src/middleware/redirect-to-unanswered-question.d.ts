/**
 * @typedef {function(import('../section').Question, import('../journey/journey-response').JourneyResponse): boolean} ShouldDisplayCondition
 */
/**
 * Redirects to the first unanswered question in a journey, or to the task list if complete
 *
 * @param {ShouldDisplayCondition[]} [conditions]
 * @returns {import('express').Handler}
 */
export function redirectToUnansweredQuestion(conditions?: ShouldDisplayCondition[]): any;
export type ShouldDisplayCondition = (arg0: any, arg1: any) => boolean;
