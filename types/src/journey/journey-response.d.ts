/**
 * @typedef {import('./journey-factory').JourneyType} JourneyType
 */
/**
 * Defines a response to a journey, a set of Answers to the questions
 * @class
 */
export class JourneyResponse {
	/**
	 * creates an instance of a JourneyResponse
	 * @param {JourneyType} journeyId
	 * @param {string} referenceId
	 * @param {Record<string, unknown> | null} answers
	 * @param {string} [lpaCode]
	 */
	constructor(journeyId: JourneyType, referenceId: string, answers: Record<string, unknown> | null, lpaCode?: string);
	/**
	 * @type {string} - reference id used in the url for the journey e.g. appeal id - provides a unique lookup for responses in combination with formId
	 */
	referenceId: string;
	/**
	 * @type {JourneyType} - a reference to the journey type e.g. has-questionnaire - provides a unique lookup for responses in combination with referenceId
	 */
	journeyId: JourneyType;
	/**
	 * @type {Record<string, unknown>} - answers to the journey
	 */
	answers: Record<string, unknown>;
	LPACode: string;
}
export type JourneyType = any;
