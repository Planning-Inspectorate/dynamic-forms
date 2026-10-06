import type { JourneyAnswers } from '#typedefs/journey-types.ts';

/**
 * Defines a response to a journey, a set of Answers to the questions
 */
export class JourneyResponse<T extends JourneyAnswers = JourneyAnswers> {
	/** reference id used in the url for the journey e.g. appeal id - provides a unique lookup for responses in combination with formId */
	referenceId: string;

	/** a reference to the journey type e.g. has-questionnaire - provides a unique lookup for responses in combination with referenceId */
	journeyId: string;

	/** answers to the journey */
	answers: T;
	/**
	 * @deprecated
	 * @private
	 */
	private LPACode: string | undefined;

	constructor(journeyId: string, referenceId: string, answers: T | null, lpaCode?: string) {
		this.journeyId = journeyId;
		this.referenceId = referenceId;
		if (answers) {
			this.answers = answers;
		} else {
			this.answers = {} as T;
		}
		this.LPACode = lpaCode;
	}
}
