/**
 * @param {(req: import('express').Request, journeyResponse: import('../journey/journey-response.js').JourneyResponse) => import('../journey/journey.js').Journey} createJourney
 * @returns {import('express').Handler}
 */
export function buildGetJourney(
	createJourney: (
		req: any,
		journeyResponse: import('../journey/journey-response.js').JourneyResponse
	) => import('../journey/journey.js').Journey
): any;
//# sourceMappingURL=build-get-journey.d.ts.map
