import { Journey } from '#src/journey/journey.js';

export function mockJourney() {
	return new Journey({
		journeyId: 'mock-journey-id',
		makeBaseUrl: () => '/journey',
		taskListUrl: 'check-your-answers',
		response: { answers: {} },
		journeyTemplate: 'journey-template',
		taskListTemplate: 'check-your-answers-template',
		informationPageViewPath: '',
		journeyTitle: 'Mock Journey',
		returnToListing: false,
		sections: [],
		initialBackLink: '/journey'
	});
}
