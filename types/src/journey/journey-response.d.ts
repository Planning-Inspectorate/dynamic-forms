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
	 * @param {import('./journey-types.d.ts').JourneyAnswers | null} answers
	 * @param {string} [lpaCode]
	 */
	constructor(
		journeyId: JourneyType,
		referenceId: string,
		answers: import('./journey-types.d.ts').JourneyAnswers | null,
		lpaCode?: string
	);
	/**
	 * @type {string} - reference id used in the url for the journey e.g. appeal id - provides a unique lookup for responses in combination with formId
	 */
	referenceId: string;
	/**
	 * @type {JourneyType} - a reference to the journey type e.g. has-questionnaire - provides a unique lookup for responses in combination with referenceId
	 */
	journeyId: JourneyType;
	/**
	 * @type {import('./journey-types.d.ts').JourneyAnswers} - answers to the journey
	 */
	answers: import('./journey-types.d.ts').JourneyAnswers;
	LPACode: string | undefined;
}
export type JourneyType = any;
