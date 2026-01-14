import { Section } from '#src/section.js';
import { Journey } from '#src/journey/journey.js';
import { ManageListSection } from '#src/components/manage-list/manage-list-section.js';
import { whenQuestionHasAnswer } from '#src/components/utils/question-has-answer.js';

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
			new Section('Example journey', 'example')
				.addQuestion(questions.nights)
				.addQuestion(questions.holidayDestination)
				.withCondition(whenQuestionHasAnswer(questions.nights, '10'))
				.addQuestion(
					questions.manageListTest,
					new ManageListSection()
						.addQuestion(questions.travelInsuranceType)
						.addQuestion(questions.activityLocation)
						.withCondition(whenQuestionHasAnswer(questions.travelInsuranceType, 'comprehensive'))
						.addQuestion(questions.departureDate)
				)
				.addQuestion(questions.holidayPeriod)
		],
		taskListUrl: 'check-your-answers',
		journeyTemplate: 'views/layout-journey-gds.njk',
		taskListTemplate: 'views/layout-edit-page-gds.njk',
		journeyTitle: 'Dynamic forms example',
		returnToListing: false,
		makeBaseUrl: () => req.baseUrl,
		initialBackLink: '/manage-a-list',
		response
	});
}
