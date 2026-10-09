import type { Question } from '../questions/question.ts';
import type { JourneyResponse } from '../journey/journey-response.ts';
import type { Handler } from 'express';

export type ShouldDisplayCondition = (question: Question, response: JourneyResponse) => boolean;

/**
 * Redirects to the first unanswered question in a journey, or to the task list if complete
 */
export function redirectToUnansweredQuestion(conditions: ShouldDisplayCondition[] = []): Handler {
	return (req, res, next) => {
		const { journeyResponse, journey } = res.locals;

		for (const section of journey.sections) {
			const response = section.getResponse(journeyResponse);
			for (const question of section.questions) {
				const answer = response?.answers[question.fieldName];

				const shouldSkip = conditions.some((condition) => condition(question, response));
				const shouldDisplay = !question.shouldDisplay || question.shouldDisplay(response);

				if (shouldSkip || !shouldDisplay) {
					continue;
				}

				// allow null or empty
				if (answer === undefined) {
					const url = journey.getCurrentQuestionUrl(section.segment, question.fieldName);
					if (req?.originalUrl?.endsWith(url)) {
						next();
						return;
					}
					return res.redirect(url);
				}
			}
		}
		return res.redirect(journey.taskListUrl);
	};
}
