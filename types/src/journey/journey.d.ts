/**
 * @typedef {import('./journey-response').JourneyResponse} JourneyResponse
 * @typedef {import('../section').Section} Section
 * @typedef {import('../questions/question').Question} Question
 */
/**
 * A journey (An entire set of questions required for a completion of a submission)
 * @class
 */
export class Journey {
	/**
	 * creates an instance of a journey
	 * @param {object} options
	 * @param {string} options.journeyId - a unique, human-readable id for this journey
	 * @param {(response: JourneyResponse) => string} options.makeBaseUrl - base url of journey
	 * @param {string} [options.taskListUrl] - task list url - added to base url, can be left undefined
	 * @param {JourneyResponse} options.response - user's response
	 * @param {string} options.journeyTemplate - template used for all views
	 * @param {string} options.taskListTemplate - path to njk view for listing page
	 * @param {string} [options.informationPageViewPath] - path to njk view for pdf summary page
	 * @param {string} options.journeyTitle - part of the title in the njk view
	 * @param {boolean} [options.returnToListing] - defines how the next/previous question handles end of sections
	 * @param {Section[]} options.sections
	 * @param {string} [options.initialBackLink] - back link when on the first question
	 */
	constructor({
		journeyId,
		makeBaseUrl,
		taskListUrl,
		response,
		journeyTemplate,
		taskListTemplate,
		informationPageViewPath,
		journeyTitle,
		returnToListing,
		sections,
		initialBackLink
	}: {
		journeyId: string;
		makeBaseUrl: (response: JourneyResponse) => string;
		taskListUrl?: string | undefined;
		response: JourneyResponse;
		journeyTemplate: string;
		taskListTemplate: string;
		informationPageViewPath?: string | undefined;
		journeyTitle: string;
		returnToListing?: boolean | undefined;
		sections: Section[];
		initialBackLink?: string | undefined;
	});
	/** @type {string} journeyId - a unique, human-readable id for this journey */
	journeyId: string;
	/** @type {Array.<Section>} sections - sections within the journey */
	sections: Array<Section>;
	/** @type {JourneyResponse} response - the user's response to the journey so far */
	response: JourneyResponse;
	/** @type {string} baseUrl - base url of the journey, gets prepended to question urls */
	baseUrl: string;
	/** @type {(journeyResponse: JourneyResponse) => string} baseUrl - base url of the journey, gets prepended to question urls */
	makeBaseUrl: (journeyResponse: JourneyResponse) => string;
	/** @type {string} taskListUrl - url that renders the task list */
	taskListUrl: string;
	/** @type {string} journeyTemplate - nunjucks template file used for */
	journeyTemplate: string;
	/** @type {string} taskListTemplate - nunjucks template file used for listing page */
	taskListTemplate: string;
	/** @type {string} informationPageViewPath - nunjucks template file used for pdf summary information page */
	informationPageViewPath: string;
	/** @type {boolean} defines how the next/previous question handles end of sections */
	returnToListing: boolean;
	/**@type {string} used as part of the overall page title */
	journeyTitle: string;
	initialBackLink: string | null;
	/**
	 * Gets section based on segment
	 * @param {string} sectionSegment
	 * @returns {Section | undefined}
	 */
	getSection(sectionSegment: string): Section | undefined;
	/**
	 * gets a question from the object's sections based on a section + question names
	 * @param {import('./journey-types.d.ts').RouteParams} params
	 * @returns {Question | undefined} question found by lookup
	 */
	getQuestionByParams(params: import('./journey-types.d.ts').RouteParams): Question | undefined;
	/**
	 * Get the back link for the journey - e.g. the previous question
	 *
	 * @param {Object} options
	 * @param {import('./journey-types.d.ts').RouteParams} options.params
	 * @param {import('#src/components/manage-list/question.js')} [options.manageListQuestion]
	 * @returns {string|null} url for the next question, or null if unmatched
	 */
	getBackLink({
		params,
		manageListQuestion
	}: {
		params: import('./journey-types.d.ts').RouteParams;
		manageListQuestion?: typeof import('#src/components/manage-list/question.js') | undefined;
	}): string | null;
	/**
	 * Handles redirect to the next question in the journey
	 * Used after question post/saving
	 *
	 * @param {import('express').Response} res
	 * @param {import('./journey-types.d.ts').RouteParams} params
	 * @param {import('#src/components/manage-list/question.js')} [manageListQuestion]
	 * @returns {void}
	 */
	redirectToNextQuestion(
		res: any,
		params: import('./journey-types.d.ts').RouteParams,
		manageListQuestion?: typeof import('#src/components/manage-list/question.js')
	): void;
	/**
	 * Get url for the next question in the journey
	 *
	 * @param {import('./journey-types.d.ts').RouteParams} params
	 * @param {Object} options
	 * @param {boolean} [options.reverse] - if passed in this will get the previous question
	 * @param {import('#src/components/manage-list/question.js')} [options.manageListQuestion]
	 * @returns {string|null} url for the next question, or null if unmatched
	 */
	getNextQuestionUrl(
		params: import('./journey-types.d.ts').RouteParams,
		{
			reverse,
			manageListQuestion
		}?: {
			reverse?: boolean | undefined;
			manageListQuestion?: typeof import('#src/components/manage-list/question.js') | undefined;
		}
	): string | null;
	/**
	 * Gets the url for the current question
	 * @param {string} sectionSegment - section segment name
	 * @param {string} questionSegment - question segment name
	 * @returns {string} url for the current question
	 */
	getCurrentQuestionUrl: (sectionSegment: string, questionSegment: string) => string;
	/**
	 * Gets the url for the current question
	 * @param {string} questionSegment - question segment name
	 * @returns {string} url for the current question
	 */
	getCurrentQuestionUrlWithoutSection: (questionSegment: string) => string;
	/**
	 * Gets the url for the current question
	 * @param {string} sectionSegment - section segment name
	 * @param {string} questionSegment - question segment name
	 * @param {string} addition - question segment name
	 * @returns {string} url for the current question
	 */
	addToCurrentQuestionUrl: (sectionSegment: string, questionSegment: string, addition: string) => string;
	/**
	 * Gets the overall completeness status of a journey based on the response associated with it and the complete state of each section.
	 * @returns {boolean} Boolean indicating if a journey response is complete
	 */
	isComplete(): boolean;
	/**
	 * @param {JourneyResponse} journeyResponse
	 */
	setResponse(journeyResponse: JourneyResponse): void;
	#private;
}
export type JourneyResponse = any;
export type Section = any;
export type Question = any;
//# sourceMappingURL=journey.d.ts.map
