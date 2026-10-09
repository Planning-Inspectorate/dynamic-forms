import { Section, Journey, ManageListSection } from '#pkg-for-tests';
import type { JourneyResponse } from '#pkg-for-tests';
import type { AllQuestions } from './questions.ts';

export const JOURNEY_ID = 'holiday-journey';

export function createJourney(questions: AllQuestions, response: JourneyResponse): Journey {
	return new Journey({
		journeyId: JOURNEY_ID,
		sections: [
			new Section('Holiday Details', 'questions')
				.addQuestion(questions.holidayActivities)
				.addQuestion(questions.addInsurance)
				.addQuestion(questions.travelInsuranceType)
				.addQuestion(questions.holidayDestination)
				.addQuestion(questions.departureDate)
				.addQuestion(questions.holidayPeriod)
				.addQuestion(questions.holidayDescription)
				.addQuestion(questions.secretWish)
				.addQuestion(questions.travelClass)
				.addQuestion(questions.holidayArrival)
				.addQuestion(questions.holidaySnack)
				.addQuestion(questions.companions)
				.addQuestion(questions.nights)
				.addQuestion(questions.hotelAddress)
				.addQuestion(questions.luggageWeight)
				.addQuestion(questions.contactEmail)
				.addQuestion(questions.favouriteActivityReason)
				.addQuestion(questions.travelRequirements)
				.addQuestion(
					questions.travelCompanions,
					new ManageListSection().addQuestion(questions.travelCompanionName).addQuestion(questions.travelCompanionEmail)
				)
		],
		taskListUrl: 'check-your-answers',
		journeyTemplate: 'views/layout-journey.njk',
		taskListTemplate: 'views/layout-check-your-answers.njk',
		journeyTitle: 'Holiday Booking',
		returnToListing: false,
		makeBaseUrl: () => '/',
		initialBackLink: '/holidays',
		response
	});
}
