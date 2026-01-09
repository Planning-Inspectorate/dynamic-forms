/**
 * @typedef {import('../validator/base-validator.js')} BaseValidator
 * @typedef {import('../journey/journey.js').Journey} Journey
 * @typedef {import('../journey/journey-response.js').JourneyResponse} JourneyResponse
 * @typedef {import('../section.js').Section} Section
 * @typedef {import('../controller.js').ActionView} ActionView
 * @typedef {import('./question-types.js').ActionLink} ActionLink
 */
/**
 * @typedef {Object} PreppedQuestion
 * @property {Object} value
 * @property {string} question
 * @property {string} fieldName
 * @property {string} pageTitle
 * @property {string} [description]
 * @property {string} [html]
 */
/**
 * @typedef {Record<string, any>} QuestionViewModel
 * @property {PreppedQuestion} question
 * @property {string} layoutTemplate
 * @property {string} pageCaption
 * @property {string} [continueButtonText]
 * @property {string} backLink
 * @property {boolean} showBackToListLink
 * @property {string} listLink
 * @property {Object} util
 * @property {function(string): string} util.trimTrailingSlash
 */
/**
 * A specific question within a journey which is made up of one (usually) or many (sometimes) components and their required content.
 * @class
 */
export class Question {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {Record<string, Function>} [methodOverrides]
	 */
	constructor(
		{
			title,
			question,
			viewFolder,
			fieldName,
			url,
			pageTitle,
			description,
			validators,
			html,
			hint,
			interfaceType,
			shouldDisplay,
			autocomplete,
			editable,
			actionLink,
			viewData
		}: import('#question-types').QuestionParameters,
		methodOverrides?: Record<string, Function>
	);
	/** @type {string} - html page title, defaults to question if not provided */
	pageTitle: string;
	/** @type {string} - title used in the summary list */
	title: string;
	/** @type {string} - question shown to user on question page */
	question: string;
	/** @type {string|undefined} - additional information to user about the question */
	description: string | undefined;
	/** @type {string} the folder name of the view */
	viewFolder: string;
	/** @type {string} the unique name of the input on the page, also used as a url segment (should this be separated) */
	fieldName: string;
	/** @type {boolean} if the question should appear in the journey overview task list or not */
	taskList: boolean;
	/** @type {Array.<BaseValidator>} array of validators that a question uses to validate answers */
	validators: Array<BaseValidator>;
	/** @type {string|undefined} hint text displayed to user */
	hint: string | undefined;
	/** @type {boolean} show return to listing page link after question */
	showBackToListLink: boolean;
	/** @type {string|undefined} alternative url slug */
	url: string | undefined;
	/** @type {string|undefined} optional html content */
	html: string | undefined;
	/** @type {string|undefined} optional question type */
	interfaceType: string | undefined;
	/** @type {ActionLink|undefined} override action link */
	actionLink: ActionLink | undefined;
	/** @type {string} 'not started' text to display (if a question has no answer) */
	notStartedText: string;
	/** @type {string} button text to display */
	continueButtonText: string;
	/** @type {string} text to display for 'change' link */
	changeActionText: string;
	/** @type {string} text to display for 'answer' link */
	answerActionText: string;
	/** @type {string} text to display for 'add' link */
	addActionText: string;
	/**
	 * @param {JourneyResponse} [response]
	 * @returns {boolean}
	 */
	shouldDisplay: () => boolean;
	details: {
		title: string;
		text: string;
	};
	autocomplete: string | undefined;
	editable: boolean;
	viewData: Record<string, any>;
	/**
	 * Is this question a manage list question?
	 * Implemented as a getter so manage list question implementations can override it,
	 * but it cannot be changed at runtime.
	 *
	 * @returns {boolean}
	 */
	get isManageListQuestion(): boolean;
	set isInManageListSection(value: boolean);
	/**
	 * Is this question added to a ManageListSection?
	 *
	 * @returns {boolean}
	 */
	get isInManageListSection(): boolean;
	/**
	 * gets the view model for this question
	 *
	 * Wraps prepQuestionForRendering to add the back link - which requires more parameters
	 * that prepQuestionForRendering doesn't need
	 *
	 * @param {Object} options
	 * @param {import('#src/journey/journey-types.d.ts').RouteParams} options.params
	 * @param {import('#src/components/manage-list/question.js')} [options.manageListQuestion]
	 * @param {Section} options.section - the current section
	 * @param {Journey} options.journey - the journey we are in
	 * @param {Record<string, unknown>} [options.customViewData] additional data to send to view
	 * @param {unknown} [options.payload]
	 * @returns {QuestionViewModel}
	 */
	toViewModel({
		params,
		manageListQuestion,
		section,
		journey,
		customViewData,
		payload
	}: {
		params: import('#src/journey/journey-types.d.ts').RouteParams;
		manageListQuestion?: typeof import('#src/components/manage-list/question.js') | undefined;
		section: Section;
		journey: Journey;
		customViewData?: Record<string, unknown> | undefined;
		payload?: unknown;
	}): QuestionViewModel;
	/**
	 * gets the base view model for this question
	 *
	 * @param {Section} section - the current section
	 * @param {Journey} journey - the journey we are in
	 * @param {Record<string, unknown>} [customViewData] additional data to send to view
	 * @param {unknown} [payload]
	 * @param {import('./question-types.d.ts').PrepQuestionForRenderingOptions} [options] - required to support manage list question
	 * @returns {QuestionViewModel}
	 */
	prepQuestionForRendering(
		section: Section,
		journey: Journey,
		customViewData?: Record<string, unknown>,
		payload?: unknown,
		options?: import('./question-types.d.ts').PrepQuestionForRenderingOptions
	): QuestionViewModel;
	/**
	 * The answer to this question for use in the viewModel
	 *
	 * Question implementations can override this for more complex answer types
	 *
	 * @param {Record<string, any>} answers - collection of answers to pull the answer from, may be from the response or the request/payload
	 * @param {Boolean} isPayload - whether the answers object is from the request/payload
	 * @returns {*|string}
	 */ answerForViewModel(answers: Record<string, any>, isPayload: boolean): any | string;
	/**
	 * Question implementations can override this to add configuration or other values to the view model
	 *
	 * If possible override this method instead of prepQuestionForRendering for simple changes to the view model
	 *
	 * @param {QuestionViewModel} viewModel
	 */ addCustomDataToViewModel(viewModel: QuestionViewModel): void;
	/**
	 * Get the answers object from the journey response, which may be nested in an array for manage list questions
	 *
	 * @param {JourneyResponse} response
	 * @param {import('./question-types.d.ts').PrepQuestionForRenderingOptions} [options]
	 * @returns {Record<string, any>}
	 */
	answerObjectFromJourneyResponse(
		response: JourneyResponse,
		{ params, manageListQuestion }?: import('./question-types.d.ts').PrepQuestionForRenderingOptions
	): Record<string, any>;
	/**
	 * renders the question
	 * @param {import('express').Response} res - the express response
	 * @param {QuestionViewModel} viewModel additional data to send to view
	 * @returns {void}
	 */
	renderAction(res: any, viewModel: QuestionViewModel): void;
	/**
	 * check for validation errors
	 * @param {import('express').Request} req
	 * @param {Journey} journey
	 * @param {Section} section
	 * @param {import('#src/components/manage-list/question.js')} [manageListQuestion]
	 * @returns {QuestionViewModel|undefined} returns the view model for displaying the error or undefined if there are no errors
	 */
	checkForValidationErrors(
		req: any,
		section: Section,
		journey: Journey,
		manageListQuestion?: typeof import('#src/components/manage-list/question.js')
	): QuestionViewModel | undefined;
	/**
	 * Get the data to save from the request, returns an object of answers
	 *
	 * @param {import('express').Request} req
	 * @param {JourneyResponse} journeyResponse - current journey response
	 * @returns {Promise<{ answers: Record<string, unknown> }>}
	 */ getDataToSave(
		req: any,
		journeyResponse: JourneyResponse
	): Promise<{
		answers: Record<string, unknown>;
	}>;
	/**
	 * check for errors after saving, by default this does nothing
	 * @param {import('express').Request} req
	 * @param {Journey} journey
	 * @param {Section} sectionObj
	 * @returns {QuestionViewModel | undefined} returns the view model for displaying the error or undefined if there are no errors
	 */ checkForSavingErrors(req: any, sectionObj: Section, journey: Journey): QuestionViewModel | undefined;
	/**
	 * Handles redirect after saving. Kept around for backwards compatibility.
	 *
	 * @param {import('express').Response} res
	 * @param {Journey} journey
	 * @param {string} sectionSegment
	 * @param {string} questionSegment
	 * @returns {void}
	 * @deprecated - use `journey.redirectToNextQuestion`
	 */
	handleNextQuestion(res: any, journey: Journey, sectionSegment: string, questionSegment: string): void;
	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @param {String} sectionSegment
	 * @param {Journey} journey
	 * @param {Object} answer
	 * @returns {Array<{
	 *   key: string;
	 *   value: string | Object;
	 *   action: {
	 *     href: string;
	 *     text: string;
	 *     visuallyHiddenText: string;
	 *   };
	 * }>}
	 */
	formatAnswerForSummary(
		sectionSegment: string,
		journey: Journey,
		answer: Object,
		capitals?: boolean
	): Array<{
		key: string;
		value: string | Object;
		action: {
			href: string;
			text: string;
			visuallyHiddenText: string;
		};
	}>;
	/**
	 * Returns the action link for the question
	 * @param {Object} answer
	 * @param {Journey} journey
	 * @param {String} sectionSegment
	 * @returns {ActionView|ActionView[]|undefined}
	 */
	getAction(sectionSegment: string, journey: Journey, answer: Object): ActionView | ActionView[] | undefined;
	/**
	 * @param {unknown} answer
	 * @returns {unknown}
	 */
	format(answer: unknown): unknown;
	/**
	 * @returns {boolean}
	 */
	isRequired(): boolean;
	/**
	 * @param {string} inputField
	 * @returns {boolean}
	 */
	fieldIsRequired(inputField: string): boolean;
	/**
	 * @param {JourneyResponse} journeyResponse
	 * @param {string} [fieldName] optional fieldname for multi field input questions
	 * @returns {boolean}
	 */
	isAnswered(journeyResponse: JourneyResponse, fieldName?: string): boolean;
	#private;
}
export type BaseValidator = typeof import('../validator/base-validator.js');
export type Journey = import('../journey/journey.js').Journey;
export type JourneyResponse = import('../journey/journey-response.js').JourneyResponse;
export type Section = import('../section.js').Section;
export type ActionView = import('../controller.js').ActionView;
export type ActionLink = import('./question-types.js').ActionLink;
export type PreppedQuestion = {
	value: Object;
	question: string;
	fieldName: string;
	pageTitle: string;
	description?: string | undefined;
	html?: string | undefined;
};
export type QuestionViewModel = Record<string, any>;
