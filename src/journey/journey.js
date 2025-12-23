/***********************************************************
 * This file holds the base class definition for a journey *
 * (e.g. questionnaire). Specific journeys should be       *
 * instances of this class                                 *
 ***********************************************************/
import { END_OF_SECTION } from '#src/section.js';

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
	/** @type {string} journeyId - a unique, human-readable id for this journey */
	journeyId;
	/** @type {Array.<Section>} sections - sections within the journey */
	sections = [];
	/** @type {JourneyResponse} response - the user's response to the journey so far */
	response;
	/** @type {string} baseUrl - base url of the journey, gets prepended to question urls */
	baseUrl = '';
	/** @type {(journeyResponse: JourneyResponse) => string} baseUrl - base url of the journey, gets prepended to question urls */
	makeBaseUrl = () => '';
	/** @type {string} taskListUrl - url that renders the task list */
	taskListUrl = '';
	/** @type {string} journeyTemplate - nunjucks template file used for */
	journeyTemplate = '';
	/** @type {string} taskListTemplate - nunjucks template file used for listing page */
	taskListTemplate = '';
	/** @type {string} informationPageViewPath - nunjucks template file used for pdf summary information page */
	informationPageViewPath = '';
	/** @type {boolean} defines how the next/previous question handles end of sections */
	returnToListing = false;
	/**@type {string} used as part of the overall page title */
	journeyTitle;

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
	}) {
		if (!journeyId || typeof journeyId !== 'string') {
			throw new Error('journeyId should be a string.');
		}

		this.journeyId = journeyId;

		this.makeBaseUrl = makeBaseUrl;
		const baseUrlStr = makeBaseUrl(response);
		if (!baseUrlStr || typeof baseUrlStr !== 'string') {
			throw new Error('baseUrl should be a string.');
		}
		this.baseUrl = this.#trimTrailingSlash(baseUrlStr);

		this.taskListUrl = this.#prependPathToUrl(this.baseUrl, taskListUrl);

		if (!journeyTemplate || typeof journeyTemplate !== 'string') {
			throw new Error('journeyTemplate should be a string.');
		}
		this.journeyTemplate = journeyTemplate;

		if (!taskListTemplate || typeof taskListTemplate !== 'string') {
			throw new Error('taskListTemplate should be a string.');
		}
		this.taskListTemplate = taskListTemplate;

		this.informationPageViewPath = informationPageViewPath || '';

		if (!journeyTitle || typeof journeyTitle !== 'string') {
			throw new Error('journeyTitle should be a string.');
		}
		this.journeyTitle = journeyTitle;

		this.returnToListing = returnToListing ?? false;

		this.response = response;

		this.sections = sections;
		this.initialBackLink = initialBackLink || null;
	}

	/**
	 * trim the final slash off of a string
	 * @param {string} urlPath
	 * @returns {string} returns a string without a trailing slash
	 */
	#trimTrailingSlash(urlPath) {
		return urlPath.endsWith('/') ? urlPath.slice(0, -1) : urlPath;
	}

	/**
	 * @param {string} originalUrl
	 * @param {string} [pathToPrepend]
	 * @returns {string}
	 */
	#prependPathToUrl(originalUrl, pathToPrepend) {
		if (!pathToPrepend) return originalUrl;

		const urlObject = new URL(originalUrl, 'http://example.com'); // requires a base url, not returned
		urlObject.pathname = this.#trimTrailingSlash(urlObject.pathname) + '/' + pathToPrepend;

		let relativeUrl = urlObject.pathname + urlObject.search;

		if (!originalUrl.startsWith('/')) relativeUrl = relativeUrl.substring(1);

		return relativeUrl;
	}

	/**
	 * utility function to build up a url to a question
	 * @param {import('./journey-types.d.ts').RouteParams} params
	 * @returns {string} url for a question
	 */
	#buildQuestionUrl(params) {
		const parts = [params.section, params.question];
		if (params.manageListAction) {
			parts.push(params.manageListAction, params.manageListItemId, params.manageListQuestion);
		}
		return this.#prependPathToUrl(this.baseUrl, parts.join('/'));
	}

	/**
	 * Gets section based on segment
	 * @param {string} sectionSegment
	 * @returns {Section | undefined}
	 */
	getSection(sectionSegment) {
		return this.sections.find((s) => {
			return s.segment === sectionSegment;
		});
	}

	/**
	 * Get question within a section
	 * @param {Section} section
	 * @param {string} questionSegment
	 * @param {{action: string, itemId: string, question: string}} [manageListParams]
	 * @returns {Question | undefined} question if it belongs in the given section
	 */
	#getQuestion(section, questionSegment, manageListParams) {
		const matchQuestion = (q, toMatch) => {
			return q.fieldName === toMatch || q.url === toMatch;
		};
		const question = section?.questions.find((q) => matchQuestion(q, questionSegment));
		if (!question) {
			return undefined;
		}
		if (manageListParams && question.isManageListQuestion) {
			return question.section.questions.find((q) => matchQuestion(q, manageListParams.question));
		}
		return question;
	}

	/**
	 * gets a question from the object's sections based on a section + question names
	 * @param {import('./journey-types.d.ts').RouteParams} params
	 * @returns {Question | undefined} question found by lookup
	 */
	getQuestionByParams(params) {
		const section = this.getSection(params.section);

		if (!section) {
			return undefined;
		}
		let manageListParams;
		if (params.manageListAction && params.manageListItemId && params.manageListQuestion) {
			manageListParams = {
				action: params.manageListAction,
				itemId: params.manageListItemId,
				question: params.manageListQuestion
			};
		}
		return this.#getQuestion(section, params.question, manageListParams);
	}

	/**
	 * Get the back link for the journey - e.g. the previous question
	 *
	 * @param {Object} options
	 * @param {import('./journey-types.d.ts').RouteParams} options.params
	 * @param {import('#src/components/manage-list/question.js')} [options.manageListQuestion]
	 * @returns {string|null} url for the next question, or null if unmatched
	 */
	getBackLink({ params, manageListQuestion }) {
		const previousQuestion = this.getNextQuestionUrl(params, {
			manageListQuestion,
			reverse: true
		});
		if (!previousQuestion) {
			return this.initialBackLink;
		}
		return previousQuestion;
	}

	/**
	 * Handles redirect to the next question in the journey
	 * Used after question post/saving
	 *
	 * @param {import('express').Response} res
	 * @param {import('./journey-types.d.ts').RouteParams} params
	 * @param {import('#src/components/manage-list/question.js')} [manageListQuestion]
	 * @returns {void}
	 */
	redirectToNextQuestion(res, params, manageListQuestion) {
		const next = this.getNextQuestionUrl(params, { manageListQuestion }) ?? this.taskListUrl;
		return res.redirect(next);
	}

	/**
	 * Get url for the next question in the journey
	 *
	 * @param {import('./journey-types.d.ts').RouteParams} params
	 * @param {Object} options
	 * @param {boolean} [options.reverse] - if passed in this will get the previous question
	 * @param {import('#src/components/manage-list/question.js')} [options.manageListQuestion]
	 * @returns {string|null} url for the next question, or null if unmatched
	 */
	getNextQuestionUrl(params, { reverse = false, manageListQuestion } = {}) {
		const numberOfSections = this.sections.length;
		const sectionsStart = reverse ? numberOfSections - 1 : 0;
		const questionFieldName = manageListQuestion ? params.manageListQuestion : params.question;

		let currentSectionIndex;
		let foundSection = false;
		let takeNextQuestion = false;

		for (let i = sectionsStart; reverse ? i >= 0 : i < numberOfSections; reverse ? i-- : i++) {
			const currentSection = this.sections[i];

			if (currentSection.segment === params.section) {
				foundSection = true;
				currentSectionIndex = i;
			}

			if (foundSection) {
				if (this.returnToListing && i !== currentSectionIndex) {
					return null;
				}
				const question = currentSection.getNextQuestion({
					questionFieldName,
					response: this.response,
					manageListQuestion,
					takeNextQuestion,
					reverse
				});
				if (question === END_OF_SECTION) {
					takeNextQuestion = true; // get the first question from the following section
				} else if (question) {
					/**
					 * if this is a regular question, then only section and question params are required
					 * don't include other params which may be set (e.g. manageList* params), as we may now be
					 * redirecting to a non-manage list question, having previously been on a manage list question
					 *
					 * @type {import('./journey-types.d.ts').RouteParams}
					 */
					let newParams = {
						section: currentSection.segment,
						question: question.url || question.fieldName
					};
					if (question.isInManageListSection && manageListQuestion) {
						// if this is in a manage list section, then the manage list params will be set
						// we need to retain the manageListAction and manageListItemId params
						newParams = {
							...params,
							// the question param is for the 'parent' manageListQuestion
							question: manageListQuestion.url,
							// the manageListQuestion param is for the next question
							manageListQuestion: question.url || question.fieldName
						};
					}
					return this.#buildQuestionUrl(newParams);
				}
			}
		}

		return null;
	}

	/**
	 * Gets the url for the current question
	 * @param {string} sectionSegment - section segment name
	 * @param {string} questionSegment - question segment name
	 * @returns {string} url for the current question
	 */
	getCurrentQuestionUrl = (sectionSegment, questionSegment) => {
		const unmatchedUrl = this.taskListUrl;

		// find section
		const matchingSection = this.getSection(sectionSegment);
		if (!matchingSection) {
			return unmatchedUrl;
		}

		// find question
		const matchingQuestion = this.#getQuestion(matchingSection, questionSegment);
		if (!matchingQuestion) {
			return unmatchedUrl;
		}

		return this.#buildQuestionUrl({
			section: matchingSection.segment,
			question: matchingQuestion.url || matchingQuestion.fieldName
		});
	};

	/**
	 * Gets the url for the current question
	 * @param {string} questionSegment - question segment name
	 * @returns {string} url for the current question
	 */
	getCurrentQuestionUrlWithoutSection = (questionSegment) => {
		return `${this.baseUrl}/${encodeURIComponent(questionSegment)}`;
	};

	/**
	 * Gets the url for the current question
	 * @param {string} sectionSegment - section segment name
	 * @param {string} questionSegment - question segment name
	 * @param {string} addition - question segment name
	 * @returns {string} url for the current question
	 */
	addToCurrentQuestionUrl = (sectionSegment, questionSegment, addition) => {
		const unmatchedUrl = this.taskListUrl;

		// find section
		const matchingSection = this.getSection(sectionSegment);
		if (!matchingSection) {
			return unmatchedUrl;
		}

		// find question
		const matchingQuestion = this.#getQuestion(matchingSection, questionSegment);
		if (!matchingQuestion) {
			return unmatchedUrl;
		}

		const questionUrl = matchingQuestion.url ?? matchingQuestion.fieldName;

		return this.#buildQuestionUrl({
			section: matchingSection.segment,
			question: questionUrl + addition
		});
	};

	/**
	 * Gets the overall completeness status of a journey based on the response associated with it and the complete state of each section.
	 * @returns {boolean} Boolean indicating if a journey response is complete
	 */
	isComplete() {
		return this.sections.every((section) => section.isComplete(this.response));
	}

	/**
	 * @param {JourneyResponse} journeyResponse
	 */
	setResponse(journeyResponse) {
		this.response = journeyResponse;
		this.baseUrl = this.#trimTrailingSlash(this.makeBaseUrl(journeyResponse));
	}
}
