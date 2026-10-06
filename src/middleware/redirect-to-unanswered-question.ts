/**
 * @typedef {function(import('../questions/question.ts').Question, import('#journey-response').JourneyResponse): boolean} ShouldDisplayCondition
 */

/**
 * Redirects to the first unanswered question in a journey, or to the task list if complete
 *
 * @param {ShouldDisplayCondition[]} [conditions]
 * @returns {import('express').Handler}
 */
export function redirectToUnansweredQuestion(conditions = []) {
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
