import { Section } from '#src/section.js';
import { Journey } from '#src/journey/journey.js';

export const JOURNEY_ID = 'test-app';

/**
 * @param {{[questionType: string]: import('../src/questions/question.js').Question}} questions
 * @param {import('../src/journey/journey-response.js').JourneyResponse} response
 * @param {import('express').Request} req
 * @returns {Journey}
 */
export function createJourney(questions, response, req) {
	return new Journey({
		journeyId: JOURNEY_ID,
		sections: [
			new Section('Manage a List', 'questions')
				.addQuestion(questions.holidayDestination)
				.addQuestion(
					questions.manageListTest,
					new Section('Activities', 'activities')
						.addQuestion(questions.addInsurance)
						.addQuestion(questions.travelInsuranceType)
				)
				.addQuestion(questions.departureDate)
				.addQuestion(questions.holidayPeriod)
		],
		taskListUrl: 'check-your-answers',
		journeyTemplate: 'views/layout-journey-gds.njk',
		taskListTemplate: 'views/layout-check-your-answers.njk',
		journeyTitle: 'Manage a list',
		returnToListing: false,
		makeBaseUrl: () => req.baseUrl,
		initialBackLink: '/manage-a-list',
		response
	});
}
