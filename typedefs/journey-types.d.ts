import type { Journey } from '../src/journey/journey.js';

/**
 * Express route parameters used for journey routes
 */
export type RouteParams = CoreRouteParams & ManageListRouteParams;

export type CoreRouteParams = {
	section: string;
	question: string;
	[key: string]: string;
};

export type ManageListRouteParams =
	| {
			manageListAction: string;
			manageListItemId: string;
			manageListQuestion: string;
	  }
	| object;

export interface JourneyAnswers {
	// if the answer is for a manage list question, the answer will be an array of answer objects
	[k: string]: unknown | ManageListAnswers[];
}

export interface JourneyResponseLike<Answers = JourneyAnswers> {
	journeyId: string;
	referenceId: string;
	answers: Answers;
	LPACode: string | undefined;
}

export interface ManageListAnswers {
	id: string;
	[k: string]: unknown;
}

/**
 * The type accepted for the `answers` constructor parameter of `JourneyResponse`.
 *
 * `null`/omitted answers resolve to `{}` at runtime. This is only type-safe to accept when an
 * empty object actually satisfies `Answers` (i.e. `Answers` has no required properties), so a
 * narrowed model with required fields must be given a real `Answers` object (or `Partial<Answers>`
 * if the application wants to allow incomplete forms).
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- `{}` here means "no required properties", not "any object"
export type JourneyResponseAnswersInput<Answers> = {} extends Answers ? Answers | null : Answers;

/**
 * Shape of `res.locals` once both `buildGetJourneyResponseFromSession` (or equivalent) and
 * `buildGetJourney` have run. Use this to type Express handlers that run after those middleware,
 * e.g. `Response<unknown, JourneyLocals<HolidayAppViewModel>>`.
 *
 * Note: TypeScript cannot verify middleware ordering - this type documents the expected shape,
 * it does not get applied automatically to handlers later in the chain.
 */
export interface JourneyLocals<Answers extends object = JourneyAnswers> {
	journeyResponse: JourneyResponseLike<Answers>;
	journey: Journey<Answers>;
}
