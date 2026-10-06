/**
 * Defines a response to a journey, a set of Answers to the questions
 * @class
 * @template {object} [Answers=import("#typedefs/journey-types.d.ts").JourneyAnswers]
 */
export class JourneyResponse {
	/**
	 * @type {string} - reference id used in the url for the journey e.g. appeal id - provides a unique lookup for responses in combination with formId
	 */
	referenceId;

	/**
	 * @type {string} - a reference to the journey type e.g. has-questionnaire - provides a unique lookup for responses in combination with referenceId
	 */
	journeyId;

	/**
	 * @type {Answers} - answers to the journey
	 */
	answers;

	/**
	 * creates an instance of a JourneyResponse
	 * @param {string} journeyId
	 * @param {string} referenceId
	 * @param {Answers | null} answers
	 * @param {string} [lpaCode]
	 */
	constructor(journeyId, referenceId, answers, lpaCode) {
		this.journeyId = journeyId;
		this.referenceId = referenceId;
		if (answers) {
			this.answers = answers;
		} else {
			this.answers = {};
		}
		this.LPACode = lpaCode;
	}
}
