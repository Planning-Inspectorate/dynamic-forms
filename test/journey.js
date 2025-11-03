import { Section } from '../src/section.js';
import { Journey } from '../src/journey/journey.js';

export const JOURNEY_ID = 'holiday-journey';

/**
 * @param {{[questionType: string]: import('../src/questions/question.js').Question}} questions
 * @param {import('../src/journey/journey-response.js').JourneyResponse} response
 * @returns {Journey}
 */
export function createJourney(questions, response) {
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
		],
		taskListUrl: 'check-your-answers',
		journeyTemplate: 'views/layout-journey.njk',
		listingPageViewPath: 'views/layout-check-your-answers.njk',
		journeyTitle: 'Holiday Booking',
		returnToListing: false,
		makeBaseUrl: () => '/',
		initialBackLink: '/holidays',
		response
	});
}
