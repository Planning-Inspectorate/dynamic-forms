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
 * @typedef {Object} QuestionViewModel
 * @property {PreppedQuestion} question
 * @property {string} layoutTemplate
 * @property {string} pageCaption
 * @property {string} [continueButtonText]
 * @property {Array.<string>} navigation
 * @property {string} backLink
 * @property {boolean} showBackToListLink
 * @property {string} listLink
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
		}: any,
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
	autocomplete: any;
	editable: any;
	viewData: any;
	/**
	 * gets the view model for this question
	 * @param {Section} section - the current section
	 * @param {Journey} journey - the journey we are in
	 * @param {Record<string, unknown>} [customViewData] additional data to send to view
	 * @param {unknown} [payload]
	 * @returns {QuestionViewModel}
	 */
	prepQuestionForRendering(
		section: Section,
		journey: Journey,
		customViewData?: Record<string, unknown>,
		payload?: unknown
	): QuestionViewModel;
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
	 * @param {Section} sectionObj
	 * @returns {QuestionViewModel|undefined} returns the view model for displaying the error or undefined if there are no errors
	 */
	checkForValidationErrors(req: any, sectionObj: Section, journey: Journey): QuestionViewModel | undefined;
	/**
	 * returns the data to send to the DB
	 * side effect: modifies journeyResponse with the new answers
	 * @param {import('express').Request} req
	 * @param {JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise<{ answers: Record<string, unknown> }>}
	 */
	getDataToSave(
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
	 * Handles redirect after saving
	 * @param {import('express').Response} res
	 * @param {Journey} journey
	 * @param {string} sectionSegment
	 * @param {string} questionSegment
	 * @returns {void}
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
		answer: any,
		capitals?: boolean
	): Array<{
		key: string;
		value: string | any;
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
	getAction(sectionSegment: string, journey: Journey, answer: any): ActionView | ActionView[] | undefined;
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
}
export type BaseValidator = typeof import('../validator/base-validator.js');
export type Journey = import('../journey/journey.js').Journey;
export type JourneyResponse = import('../journey/journey-response.js').JourneyResponse;
export type Section = import('../section.js').Section;
export type ActionView = import('../controller.js').ActionView;
export type ActionLink = any;
export type PreppedQuestion = {
	value: any;
	question: string;
	fieldName: string;
	pageTitle: string;
	description?: string;
	html?: string;
};
export type QuestionViewModel = {
	question: PreppedQuestion;
	layoutTemplate: string;
	pageCaption: string;
	continueButtonText?: string;
	navigation: Array<string>;
	backLink: string;
	showBackToListLink: boolean;
	listLink: string;
};
