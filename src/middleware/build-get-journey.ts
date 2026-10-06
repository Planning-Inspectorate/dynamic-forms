import type { JourneyResponse } from '#src/journey/journey-response.ts';
import type { Journey } from '#src/journey/journey.ts';
import type { Request, Handler } from 'express';

export type CreateJourney = (req: Request, journeyResponse: JourneyResponse) => Journey;

export function buildGetJourney(createJourney: CreateJourney): Handler {
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
