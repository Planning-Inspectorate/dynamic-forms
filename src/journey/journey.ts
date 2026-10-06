/***********************************************************
 * This file holds the base class definition for a journey *
 * (e.g. questionnaire). Specific journeys should be       *
 * instances of this class                                 *
 ***********************************************************/
import type { Section } from '#src/section.ts';
import { END_OF_SECTION } from '#src/section.ts';
import { MANAGE_LIST_ACTIONS } from '#src/components/manage-list/manage-list-actions.ts';
import type { JourneyResponse } from '#src/journey/journey-response.ts';
import type { RouteParams } from '#typedefs/journey-types.ts';
import type { Question } from '#src/questions/question.ts';
import type ManageListQuestion from '#src/components/manage-list/question.ts';
import type { Response } from 'express';

export type MakeBaseUrl = (journeyResponse: JourneyResponse) => string;

export interface JourneyParams {
	/** a unique, human-readable id for this journey */
	journeyId: string;
	makeBaseUrl: MakeBaseUrl;
	/** added to base url, can be left undefined */
	taskListUrl?: string;
	response: JourneyResponse;
	/** template used for all (question) views */
	journeyTemplate: string;
	/** path to njk view for listing page */
	taskListTemplate: string;
	// TODO: deprecate this property
	/** path to njk view for pdf summary page */
	informationPageViewPath?: string;
	/** part of the title in the njk view */
	journeyTitle: string;
	/** defines how the next/previous question handles end of sections */
	returnToListing?: boolean;
	sections: Section[];
	/** back link when on the first question */
	initialBackLink?: string;
}

/**
 * A journey (An entire set of questions required for a completion of a submission)
 * @class
 */
export class Journey {
	/** a unique, human-readable id for this journey */
	journeyId: string;
	/** sections within the journey */
	sections: Section[] = [];
	/** the user's response to the journey so far */
	response: JourneyResponse;
	/** baseUrl - base url of the journey, gets prepended to question urls */
	baseUrl: string = '';
	/** function to generate base url of the journey */
	makeBaseUrl: MakeBaseUrl = () => '';
	/** url that renders the task list */
	taskListUrl: string = '';
	/** nunjucks template file used for */
	journeyTemplate: string = '';
	/** nunjucks template file used for listing page */
	taskListTemplate: string = '';
	/** nunjucks template file used for pdf summary information page */
	informationPageViewPath: string = '';
	/** defines how the next/previous question handles end of sections */
	returnToListing: boolean = false;
	/** used as part of the overall page title */
	journeyTitle: string;
	/** back link when on the first question */
	initialBackLink: string | null;

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
	}: JourneyParams) {
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
	 * returns a string without a trailing slash
	 */
	#trimTrailingSlash(urlPath: string) {
		return urlPath.endsWith('/') ? urlPath.slice(0, -1) : urlPath;
	}

	#prependPathToUrl(originalUrl: string, pathToPrepend?: string) {
		if (!pathToPrepend) return originalUrl;

		const urlObject = new URL(originalUrl, 'http://example.com'); // requires a base url, not returned
		urlObject.pathname = this.#trimTrailingSlash(urlObject.pathname) + '/' + pathToPrepend;

		let relativeUrl = urlObject.pathname + urlObject.search;

		if (!originalUrl.startsWith('/')) relativeUrl = relativeUrl.substring(1);

		return relativeUrl;
	}

	/**
	 * utility function to build up a url to a question
	 */
	#buildQuestionUrl(params: RouteParams) {
		const parts = [params.section, params.question];
		if (params.manageListAction) {
			parts.push(params.manageListAction, params.manageListItemId, params.manageListQuestion);
		}
		return this.#prependPathToUrl(this.baseUrl, parts.join('/'));
	}

	/**
	 * Gets section based on segment
	 */
	getSection(sectionSegment: string) {
		return this.sections.find((s) => {
			return s.segment === sectionSegment;
		});
	}

	/**
	 * Get the response for the given section, required to support dynamic sections
	 *
	 * Often used in formatAnswerForSummary to get other answer fields.
	 */
	responseForSection(sectionSegment: string) {
		const section = this.getSection(sectionSegment);
		if (!section) {
			throw new Error(`No section found for section segment: '${sectionSegment}'`);
		}
		return section.getResponse(this.response);
	}

	/**
	 * Get question within a section
	 * @returns question if it belongs in the given section
	 */
	#getQuestion(
		section: Section,
		questionSegment: string,
		manageListParams?: { action: string; itemId: string; question: string }
	): Question | undefined {
		const matchQuestion = (q: Question, toMatch: string) => {
			return q.fieldName === toMatch || q.url === toMatch;
		};
		const question = section?.questions.find((q) => matchQuestion(q, questionSegment));
		if (!question) {
			return undefined;
		}
		if (manageListParams && question.isManageListQuestion) {
			const manageListQuestion = question as ManageListQuestion;
			if (
				manageListParams.question === manageListQuestion.confirmationQuestionParam &&
				manageListParams.action === MANAGE_LIST_ACTIONS.REMOVE
			) {
				// special case for the delete confirmation page
				return manageListQuestion;
			}
			return manageListQuestion.section.questions.find((q) => matchQuestion(q, manageListParams.question));
		}
		return question;
	}

	/**
	 * gets a question from the object's sections based on a section + question names
	 * @returns  uestion found by lookup
	 */
	getQuestionByParams(params: RouteParams): Question | undefined {
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
	 * @returns url for the next question, or null if unmatched
	 */
	getBackLink({ params, manageListQuestion }: { params: RouteParams; manageListQuestion?: ManageListQuestion }) {
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
	 */
	redirectToNextQuestion(res: Response, params: RouteParams, manageListQuestion?: ManageListQuestion) {
		const next = this.getNextQuestionUrl(params, { manageListQuestion }) ?? this.taskListUrl;
		return res.redirect(next);
	}

	/**
	 * Get url for the next question in the journey
	 * Pass `reverse` to get the previous question.
	 *
	 * @returns url for the next question, or null if unmatched
	 */
	getNextQuestionUrl(
		params: RouteParams,
		{ reverse = false, manageListQuestion }: { reverse?: boolean; manageListQuestion?: ManageListQuestion } = {}
	) {
		const numberOfSections = this.sections.length;
		const sectionsStart = reverse ? numberOfSections - 1 : 0;
		const questionFieldName = manageListQuestion ? params.manageListQuestion : params.question;
		if (
			params.manageListAction === MANAGE_LIST_ACTIONS.REMOVE &&
			Object.hasOwn(params, 'manageListItemId') &&
			Object.hasOwn(params, 'manageListQuestion')
		) {
			// If you have just confirmed removal of an item, go back to the parent manage list question
			return this.#buildQuestionUrl({
				section: params.section,
				question: params.question
			});
		}

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
					routeParams: params,
					reverse
				});
				if (isEndOfSection(question)) {
					takeNextQuestion = true; // get the first question from the following section
				} else if (question) {
					/**
					 * if this is a regular question, then only section and question params are required
					 * don't include other params which may be set (e.g. manageList* params), as we may now be
					 * redirecting to a non-manage list question, having previously been on a manage list question
					 */
					let newParams: RouteParams = {
						section: currentSection.segment,
						question: question.url || question.fieldName
					};
					if (question.isInManageListSection && manageListQuestion) {
						// if this is in a manage list section, then the manage list params will be set
						// we need to retain the manageListAction and manageListItemId params
						newParams = {
							...params,
							// the question param is for the 'parent' manageListQuestion
							question: manageListQuestion.url as string,
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
	 */
	getCurrentQuestionUrl = (sectionSegment: string, questionSegment: string) => {
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
	 */
	getCurrentQuestionUrlWithoutSection = (questionSegment: string) => {
		return `${this.baseUrl}/${encodeURIComponent(questionSegment)}`;
	};

	/**
	 * Gets the url for the current question
	 */
	addToCurrentQuestionUrl = (sectionSegment: string, questionSegment: string, addition: string) => {
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
	 * @returns is the journey response complete
	 */
	isComplete() {
		return this.sections.every((section) => section.isComplete(this.response));
	}

	setResponse(journeyResponse: JourneyResponse) {
		this.response = journeyResponse;
		this.baseUrl = this.#trimTrailingSlash(this.makeBaseUrl(journeyResponse));
	}
}

function isEndOfSection(question: Question | symbol | null): question is symbol {
	return question === END_OF_SECTION;
}
