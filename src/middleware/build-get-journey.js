/**
 * @template {object} [Answers=import('#typedefs/journey-types.d.ts').JourneyAnswers]
 * @param {(req: import('express').Request, journeyResponse: import('../journey/journey-response.js').JourneyResponse<Answers>) => import('../journey/journey.js').Journey<Answers>} createJourney
 * @returns {import('express').RequestHandler<any, any, any, any, import('#typedefs/journey-types.d.ts').JourneyLocals<Answers>>}
 */
export function buildGetJourney(createJourney) {
	return (req, res, next) => {
		if (!('journeyId' in res.locals.journeyResponse)) {
			throw new Error('no journey ID specified');
		}
		const { journeyId } = res.locals.journeyResponse;
		const journey = createJourney(req, res.locals.journeyResponse);
		if (journeyId !== journey.journeyId) {
			throw new Error('journey ID mismatch');
		}
		journey.setResponse(res.locals.journeyResponse);
		res.locals.journey = journey;
		next();
	};
}
