import escape from 'escape-html';
import RequiredValidator from '../validator/required-validator.js';
import RequiredFileUploadValidator from '../validator/required-file-upload-validator.js';
import { capitalize, nl2br } from '../lib/utils.js';
import AddressValidator from '../validator/address-validator.js';
import MultiFieldInputValidator from '../validator/multi-field-input-validator.js';

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
 */

/**
 * A specific question within a journey which is made up of one (usually) or many (sometimes) components and their required content.
 * @class
 */
export class Question {
	/** @type {string} - html page title, defaults to question if not provided */
	pageTitle;
	/** @type {string} - title used in the summary list */
	title;
	/** @type {string} - question shown to user on question page */
	question;
	/** @type {string|undefined} - additional information to user about the question */
	description;
	/** @type {string} the folder name of the view */
	viewFolder;
	/** @type {string} the unique name of the input on the page, also used as a url segment (should this be separated) */
	fieldName;
	/** @type {boolean} if the question should appear in the journey overview task list or not */
	taskList = true;
	/** @type {Array.<BaseValidator>} array of validators that a question uses to validate answers */
	validators = [];
	/** @type {string|undefined} hint text displayed to user */
	hint;
	/** @type {boolean} show return to listing page link after question */
	showBackToListLink = true;
	/** @type {string|undefined} alternative url slug */
	url;
	/** @type {string|undefined} optional html content */
	html;
	/** @type {string|undefined} optional question type */
	interfaceType;
	/** @type {ActionLink|undefined} override action link */
	actionLink;

	/** @type {string} 'not started' text to display (if a question has no answer) */
	notStartedText = 'Not started';
	/** @type {string} button text to display */
	continueButtonText = 'Continue';
	/** @type {string} text to display for 'change' link */
	changeActionText = 'Change';
	/** @type {string} text to display for 'answer' link */
	answerActionText = 'Answer';
	/** @type {string} text to display for 'add' link */
	addActionText = 'Add';

	/**
	 * @param {JourneyResponse} [response]
	 * @returns {boolean}
	 */
	shouldDisplay = () => true;

	details = {
		title: '',
		text: ''
	};
	#isInManageListSection = false;

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
			editable = true,
			actionLink,
			viewData = {}
		},
		methodOverrides
	) {
		if (!title || title === '') throw new Error('title parameter is mandatory');
		if (!question || question === '') throw new Error('question parameter is mandatory');
		if (!viewFolder || viewFolder === '') throw new Error('viewFolder parameter is mandatory');
		if (!fieldName || fieldName === '') throw new Error('fieldName parameter is mandatory');
		this.title = title;
		this.question = question;
		this.viewFolder = viewFolder;
		this.fieldName = fieldName;
		this.url = url;
		this.html = html;
		this.pageTitle = pageTitle ?? question;
		this.description = description;
		this.hint = hint;
		this.interfaceType = interfaceType;
		this.autocomplete = autocomplete;
		this.editable = editable;
		this.actionLink = actionLink;
		this.viewData = viewData;

		if (shouldDisplay) {
			this.shouldDisplay = shouldDisplay;
		}

		if (Array.isArray(validators)) {
			this.validators = validators;
		}

		Object.entries(methodOverrides || {}).forEach(([methodName, methodOverride]) => {
			// @ts-ignore
			this[methodName] = methodOverride.bind(this);
		});
	}

	/**
	 * Is this question a manage list question?
	 * Implemented as a getter so manage list question implementations can override it,
	 * but it cannot be changed at runtime.
	 *
	 * @returns {boolean}
	 */
	get isManageListQuestion() {
		return false;
	}

	/**
	 * Is this question added to a ManageListSection?
	 *
	 * @returns {boolean}
	 */
	get isInManageListSection() {
		return this.#isInManageListSection;
	}

	set isInManageListSection(value) {
		if (!value) {
			throw new Error('Question isInManageListSection is false by default');
		}
		this.#isInManageListSection = value;
	}

	/**
	 * gets the view model for this question
	 *
	 * Wraps prepQuestionForRendering to add the back link - which requires more parameters
	 * that prepQuestionForRendering doesn't need
	 *
	 * @param {Object} options
	 * @param {import('#src/journey/journey-types.d.ts').RouteParams} options.params
	 * @param {import('#src/components/manage-list/question.js')} [options.manageListQuestion]
	 * @param {Section} section - the current section
	 * @param {Journey} journey - the journey we are in
	 * @param {Record<string, unknown>} [customViewData] additional data to send to view
	 * @param {unknown} [payload]
	 * @returns {QuestionViewModel}
	 */
	toViewModel({ params, manageListQuestion, section, journey, customViewData, payload }) {
		const viewModel = this.prepQuestionForRendering(section, journey, customViewData, payload);
		viewModel.backLink = journey.getBackLink({ params, manageListQuestion });
		return viewModel;
	}

	/**
	 * gets the base view model for this question
	 *
	 * @param {Section} section - the current section
	 * @param {Journey} journey - the journey we are in
	 * @param {Record<string, unknown>} [customViewData] additional data to send to view
	 * @param {unknown} [payload]
	 * @returns {QuestionViewModel}
	 */
	prepQuestionForRendering(section, journey, customViewData, payload) {
		const answer = journey.response.answers[this.fieldName] || '';

		const viewModel = {
			question: {
				value: answer,
				question: this.question,
				fieldName: this.fieldName,
				pageTitle: this.pageTitle,
				description: this.description,
				html: this.html,
				hint: this.hint,
				interfaceType: this.interfaceType,
				autocomplete: this.autocomplete
			},
			answer,

			layoutTemplate: journey.journeyTemplate,
			pageCaption: section?.name,

			showBackToListLink: this.showBackToListLink,
			listLink: journey.taskListUrl,
			journeyTitle: journey.journeyTitle,
			payload,

			continueButtonText: this.continueButtonText,

			...customViewData,
			...this.viewData
		};
		this.addCustomDataToViewModel(viewModel);
		return viewModel;
	}

	/**
	 * Question implementations can override this to add configuration or other values to the view model
	 *
	 * If possible override this method instead of prepQuestionForRendering for simple changes to the view model
	 *
	 * @param {QuestionViewModel} viewModel
	 */ // eslint-disable-next-line no-unused-vars
	addCustomDataToViewModel(viewModel) {}

	/**
	 * renders the question
	 * @param {import('express').Response} res - the express response
	 * @param {QuestionViewModel} viewModel additional data to send to view
	 * @returns {void}
	 */
	renderAction(res, viewModel) {
		let view = `components/${this.viewFolder}/index`;
		if (this.viewFolder.includes('/')) {
			// custom view folder
			view = `${this.viewFolder}/index`;
		}
		res.render(view, viewModel);
	}

	/**
	 * check for validation errors
	 * @param {import('express').Request} req
	 * @param {Journey} journey
	 * @param {Section} section
	 * @param {import('#src/components/manage-list/question.js')} [manageListQuestion]
	 * @returns {QuestionViewModel|undefined} returns the view model for displaying the error or undefined if there are no errors
	 */
	checkForValidationErrors(req, section, journey, manageListQuestion) {
		const { body = {} } = req;
		const { errors = {}, errorSummary = [] } = body;

		if (Object.keys(errors).length > 0) {
			return this.toViewModel({
				params: req.params,
				section,
				journey,
				customViewData: {
					errors,
					errorSummary
				},
				payload: body,
				manageListQuestion
			});
		}
	}

	/**
	 * returns the data to send to the DB
	 * side effect: modifies journeyResponse with the new answers
	 * @param {import('express').Request} req
	 * @param {JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise<{ answers: Record<string, unknown> }>}
	 */
	async getDataToSave(req, journeyResponse) {
		/**
		 * @type {{ answers: Record<string, unknown> }}
		 */
		let responseToSave = { answers: {} };

		responseToSave.answers[this.fieldName] = req.body[this.fieldName];

		for (const propName in req.body) {
			if (propName.startsWith(this.fieldName + '_')) {
				responseToSave.answers[propName] = req.body[propName];
				journeyResponse.answers[propName] = req.body[propName];
			}
			// todo: sort this
			// } else if (numericFields.has(propName)) {
			// 	const numericValue = Number(req.body[propName]);
			// 	if (!isNaN(numericValue)) {
			// 		responseToSave.answers[propName] = numericValue;
			// 		journeyResponse.answers[propName] = numericValue;
			// 	}
			// }
		}

		journeyResponse.answers[this.fieldName] = responseToSave.answers[this.fieldName];

		return responseToSave;
	}

	/**
	 * check for errors after saving, by default this does nothing
	 * @param {import('express').Request} req
	 * @param {Journey} journey
	 * @param {Section} sectionObj
	 * @returns {QuestionViewModel | undefined} returns the view model for displaying the error or undefined if there are no errors
	 */ //eslint-disable-next-line no-unused-vars
	checkForSavingErrors(req, sectionObj, journey) {
		return;
	}

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
	handleNextQuestion(res, journey, sectionSegment, questionSegment) {
		return journey.redirectToNextQuestion(res, {
			section: sectionSegment,
			question: questionSegment
		});
	}

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
	formatAnswerForSummary(sectionSegment, journey, answer, capitals = true) {
		const formattedAnswer = capitals ? capitalize(answer ?? this.notStartedText) : (answer ?? this.notStartedText);
		const action = this.getAction(sectionSegment, journey, answer);
		const key = this.title ?? this.question;
		let rowParams = [];
		rowParams.push({
			key: key,
			value: nl2br(escape(formattedAnswer)),
			action: action
		});
		return rowParams;
	}

	/**
	 * Returns the action link for the question
	 * @param {Object} answer
	 * @param {Journey} journey
	 * @param {String} sectionSegment
	 * @returns {ActionView|ActionView[]|undefined}
	 */
	getAction(sectionSegment, journey, answer) {
		if (this.actionLink) {
			// show the override if its set
			return {
				href: this.actionLink.href,
				text: this.actionLink.text,
				visuallyHiddenText: this.question
			};
		}
		if (!this.editable) {
			return;
		}
		const isAnswerProvided = answer !== null && answer !== undefined && answer !== '';

		return {
			href: journey.getCurrentQuestionUrl(sectionSegment, this.fieldName),
			text: isAnswerProvided ? this.changeActionText : this.answerActionText,
			visuallyHiddenText: this.question
		};
	}

	/**
	 * @param {unknown} answer
	 * @returns {unknown}
	 */
	format(answer) {
		return answer;
	}

	/**
	 * @returns {boolean}
	 */
	isRequired() {
		return this.validators?.some(
			(item) =>
				item instanceof RequiredValidator ||
				item instanceof RequiredFileUploadValidator ||
				(item instanceof AddressValidator && item.isRequired()) ||
				(item instanceof MultiFieldInputValidator && item.isRequired())
		);
	}
	/**
	 * @param {string} inputField
	 * @returns {boolean}
	 */
	fieldIsRequired(inputField) {
		return this.validators?.some(
			(item) => item instanceof MultiFieldInputValidator && item.inputFieldIsRequired(inputField)
		);
	}

	/**
	 * @param {JourneyResponse} journeyResponse
	 * @param {string} [fieldName] optional fieldname for multi field input questions
	 * @returns {boolean}
	 */
	isAnswered(journeyResponse, fieldName = this.fieldName) {
		return !!journeyResponse.answers[fieldName];
	}
}
