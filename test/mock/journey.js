import { Journey } from '#src/journey/journey.js';

export function mockJourney() {
	return new Journey({
		journeyId: 'mock-journey-id',
		makeBaseUrl: () => '/journey',
		taskListUrl: 'check-your-answers',
		response: { answers: {} },
		journeyTemplate: 'views/layout-journey.njk',
		taskListTemplate: 'views/layout-check-your-answers.njk',
		informationPageViewPath: '',
		journeyTitle: 'Mock Journey',
		returnToListing: false,
		sections: [],
		initialBackLink: '/journey'
	});
}
