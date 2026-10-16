import type { JourneyAnswers } from '../types/journey-types.ts';
import { Journey } from './journey.ts';

/**
 * A journey class to use with display logic where methods require it,
 * such as formatAnswerForSummary within ManageList
 */
export class JourneyForDisplay<TAnswers extends JourneyAnswers> extends Journey {
	constructor(answers: TAnswers) {
		super({
			journeyId: 'mock-journey-id',
			journeyTemplate: 'mock-template',
			journeyTitle: 'mock-title',
			sections: [],
			taskListTemplate: 'mock-template',
			makeBaseUrl: () => '/',
			response: {
				journeyId: 'mock-journey-id',
				referenceId: 'mock-reference-id',
				LPACode: undefined,
				answers
			}
		});
	}

	/**
	 * It is assumed the answers passed to this class will always apply,
	 * there are no sections to search
	 */
	override responseForSection() {
		return this.response;
	}
}
