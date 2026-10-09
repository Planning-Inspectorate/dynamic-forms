import escape from 'escape-html';
import { capitalize, nl2br, trimTrailingSlash } from '../lib/utils.ts';
import MultiFieldInputValidator from '../validator/multi-field-input-validator.ts';
import { answerObjectForListItem } from '../lib/answer-utils.ts';
import type {
	ActionLink,
	ActionView,
	PrepQuestionForRenderingOptions,
	QuestionParameters,
	QuestionViewModel,
	SummaryRow
} from '../types/question-types.ts';
import type { SummaryFormatterContext, SummaryValueFormatter } from '../types/question-props.ts';
import type BaseValidator from '../validator/base-validator.ts';
import type { JourneyResponse } from '../journey/journey-response.ts';
import type { Response, Request } from 'express';
import type { Section } from '../section.ts';
import type ManageListQuestion from '../components/manage-list/question.ts';
import type { Journey } from '../journey/journey.ts';
import type { RouteParams } from '../types/journey-types.ts';
import type { DynamicSection } from '../dynamic-section.ts';

export interface ToViewModelParams {
	params: RouteParams;
	journey: Journey;
	section: Section;
	manageListQuestion?: ManageListQuestion;
	customViewData?: Record<string, unknown>;
	payload?: Record<string, unknown>;
}

export type QuestionCondition = (response: JourneyResponse) => boolean;
// we want a generic function type here
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type QuestionMethodOverrides = Record<string, Function>;

/**
 * A specific question within a journey which is made up of one (usually) or many (sometimes) components and their required content.
 * @class
 */
export class Question {
	/** html page title, defaults to question if not provided */
	pageTitle: string;
	/** title used in the summary list */
	title: string;
	/** question shown to user on question page */
	question: string;
	/** additional information to user about the question */
	description: string | undefined;
	/** the folder name of the view */
	viewFolder: string;
	/** the unique name of the input on the page, also used as a url segment (should this be separated) */
	fieldName: string;
	/** if the question should appear in the journey overview task list or not */
	taskList: boolean = true;
	/** array of validators that a question uses to validate answers */
	validators: BaseValidator[] = [];
	/** hint text displayed to user */
	hint: string | undefined;
	/** show return to listing page link after question */
	showBackToListLink: boolean = true;
	/** alternative url slug */
	url: string | undefined;
	/** optional html content */
	html: string | undefined;
	/** optional question type */
	interfaceType: string | undefined;
	/** override action link */
	actionLink: ActionLink | undefined;

	/** 'not started' text to display (if a question has no answer) */
	notStartedText: string = 'Not started';
	/** whether to capitalize the first letter of the answer in summary */
	capitaliseAnswer: boolean = true;
	/** button text to display */
	continueButtonText: string = 'Continue';
	/** text to display for 'change' link */
	changeActionText: string = 'Change';
	/** text to display for 'answer' link */
	answerActionText: string = 'Answer';
	/** text to display for 'add' link */
	addActionText: string = 'Add';
	/** custom function to format the summary display value */
	formatSummaryValue: SummaryValueFormatter | undefined;

	// TODO: move to questions which support autocomplete?
	autocomplete: string | undefined;
	editable: boolean | undefined;
	viewData: QuestionParameters['viewData'];

	shouldDisplay: QuestionCondition = () => true;

	details = {
		title: '',
		text: ''
	};

	private _isInManageListSection: boolean = false;

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
			viewData = {},
			formatSummaryValue,
			capitaliseAnswer = true
		}: QuestionParameters,
		methodOverrides?: QuestionMethodOverrides
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
		this.formatSummaryValue = formatSummaryValue;
		this.capitaliseAnswer = capitaliseAnswer;

		if (shouldDisplay) {
			this.shouldDisplay = shouldDisplay;
		}

		if (Array.isArray(validators)) {
			this.validators = validators;
		}

		Object.entries(methodOverrides || {}).forEach(([methodName, methodOverride]) => {
			// @ts-expect-error the types are not specific enough for this
			this[methodName] = methodOverride.bind(this);
		});
	}

	/**
	 * Is this question a manage list question?
	 * Implemented as a getter so manage list question implementations can override it,
	 * but it cannot be changed at runtime.
	 */
	get isManageListQuestion(): boolean {
		return false;
	}

	/**
	 * Is this question added to a ManageListSection?
	 */
	get isInManageListSection(): boolean {
		return this._isInManageListSection;
	}

	set isInManageListSection(value: boolean) {
		if (!value) {
			throw new Error('Question isInManageListSection is false by default');
		}
		this._isInManageListSection = value;
	}

	/**
	 * Applies custom summary formatting if a formatSummaryValue function is provided
	 * @param context - the context for formatting
	 */
	#applyCustomSummaryFormatter(context: SummaryFormatterContext): string {
		if (this.formatSummaryValue) {
			return this.formatSummaryValue(context);
		}
		return context.formattedAnswer;
	}

	/**
	 * Gets the body field names used by this question in form submissions.
	 * Returns the field names that should be present in req.body when this question is submitted.
	 * Subclasses should override this for questions with multiple or differently-named body fields.
	 */
	get bodyFieldNames(): string[] {
		return [this.fieldName];
	}

	/**
	 * gets the view model for this question
	 *
	 * Wraps prepQuestionForRendering to add the back link - which requires more parameters
	 * that prepQuestionForRendering doesn't need
	 */
	toViewModel({
		params,
		manageListQuestion,
		section,
		journey,
		customViewData,
		payload
	}: ToViewModelParams): QuestionViewModel {
		const viewModel = this.prepQuestionForRendering(section, journey, customViewData, payload, {
			params,
			manageListQuestion,
			dynamicSection: section.isDynamicSection ? (section as DynamicSection) : undefined
		});
		viewModel.backLink = journey.getBackLink({ params, manageListQuestion });
		return viewModel;
	}

	/**
	 * gets the base view model for this question
	 */
	prepQuestionForRendering(
		section: Section,
		journey: Journey,
		customViewData?: Record<string, unknown>,
		payload?: Record<string, unknown>,
		options?: PrepQuestionForRenderingOptions
	): QuestionViewModel {
		const answers = payload || this.answerObjectFromJourneyResponse(journey.response, options);
		const answer = this.answerForViewModel(answers, Boolean(payload));

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

			util: {
				trimTrailingSlash
			},

			...customViewData,
			...this.viewData
		};
		this.addCustomDataToViewModel(viewModel);
		return viewModel;
	}

	/**
	 * The answer to this question for use in the viewModel
	 *
	 * Question implementations can override this for more complex answer types
	 *
	 * @param answers - collection of answers to pull the answer from, may be from the response or the request/payload
	 * @param isPayload - whether the answers object is from the request/payload
	 */ //eslint-disable-next-line @typescript-eslint/no-unused-vars
	answerForViewModel(answers: Record<string, unknown>, isPayload: boolean): unknown | string {
		return answers[this.fieldName] || '';
	}

	/**
	 * Question implementations can override this to add configuration or other values to the view model
	 *
	 * If possible override this method instead of prepQuestionForRendering for simple changes to the view model
	 */ //eslint-disable-next-line @typescript-eslint/no-unused-vars
	addCustomDataToViewModel(viewModel: QuestionViewModel) {}

	/**
	 * Get the answers object from the journey response, which may be nested in an array for manage list questions
	 */
	answerObjectFromJourneyResponse(
		response: JourneyResponse,
		{ params, manageListQuestion, dynamicSection }: Partial<PrepQuestionForRenderingOptions> = {}
	): Record<string, unknown> {
		if (this.isInManageListSection) {
			if (!params?.manageListItemId) {
				throw new Error('no list item id for manage list question');
			}
			if (!manageListQuestion) {
				throw new Error('no manageListQuestion for manage list question');
			}
			// if this is a manage list question, the response is within the 'parent' manage list answers array
			return answerObjectForListItem(response, manageListQuestion, params.manageListItemId);
		}
		if (dynamicSection) {
			if (!params?.section) {
				throw new Error('no section param for dynamic section');
			}
			// if this is a question in a dynamic section, the response is within an answers array, key by section
			return answerObjectForListItem(response, dynamicSection, params.section);
		}
		return response.answers;
	}

	/**
	 * renders the question
	 */
	renderAction(res: Response, viewModel: QuestionViewModel) {
		let view = `components/${this.viewFolder}/index`;
		if (this.viewFolder.includes('/')) {
			// custom view folder
			view = `${this.viewFolder}/index`;
		}
		res.render(view, viewModel);
	}

	/**
	 * check for validation errors
	 * @returns returns the view model for displaying the error or undefined if there are no errors
	 */
	checkForValidationErrors(
		req: Request,
		section: Section,
		journey: Journey,
		manageListQuestion?: ManageListQuestion
	): QuestionViewModel | undefined {
		const { body = {} } = req;
		const { errors = {}, errorSummary = [] } = body;

		if (Object.keys(errors).length > 0) {
			return this.toViewModel({
				params: req.params as RouteParams,
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
	 * Get the data to save from the request, returns an object of answers
	 */ //eslint-disable-next-line @typescript-eslint/no-unused-vars
	async getDataToSave(req: Request, journeyResponse: JourneyResponse): Promise<{ answers: Record<string, unknown> }> {
		const answers: Record<string, unknown> = {};

		answers[this.fieldName] = req.body[this.fieldName];

		for (const propName in req.body) {
			if (propName.startsWith(this.fieldName + '_')) {
				answers[propName] = req.body[propName];
			}
		}

		return { answers };
	}

	/**
	 * check for errors after saving, by default this does nothing
	 * @returns returns the view model for displaying the error or undefined if there are no errors
	 */ //eslint-disable-next-line @typescript-eslint/no-unused-vars
	checkForSavingErrors(req: Request, sectionObj: Section, journey: Journey): QuestionViewModel | undefined {
		return;
	}

	/**
	 * Handles redirect after saving. Kept around for backwards compatibility.
	 *
	 * @deprecated - use `journey.redirectToNextQuestion`
	 */
	handleNextQuestion(res: Response, journey: Journey, sectionSegment: string, questionSegment: string) {
		return journey.redirectToNextQuestion(res, {
			section: sectionSegment,
			question: questionSegment
		});
	}

	/**
	 * returns the formatted answers values to be used to build task list elements
	 *
	 * If overriding this method and access answers on the journey, use journey.responseForSection
	 * to get the answers, instead of `journey.response` directly. This is to support DynamicSections
	 * where answers are in an array. See `MultiFieldInputQuestion` for an example.
	 *
	 * @param sectionSegment
	 * @param journey
	 * @param answer
	 * @param [capitals] - deprecated: use capitaliseAnswer property instead
	 */
	formatAnswerForSummary(sectionSegment: string, journey: Journey, answer: unknown, capitals?: boolean): SummaryRow[] {
		let formattedAnswer = this.formatAnswer(answer);

		// Handle deprecated capitals parameter
		// TODO DF-49 fully remove capitals parameter
		if (capitals !== undefined && capitals !== this.capitaliseAnswer) {
			console.warn(
				`[Deprecation Warning] The 'capitals' parameter in formatAnswerForSummary is deprecated. ` +
					`Set 'capitaliseAnswer: ${capitals}' in the question constructor instead.`
			);
			// Temporarily override for backwards compatibility
			const originalCapitalize = this.capitaliseAnswer;
			this.capitaliseAnswer = capitals;
			formattedAnswer = this.formatAnswer(answer);
			this.capitaliseAnswer = originalCapitalize;
		}

		const action = this.getAction(sectionSegment, journey, answer);
		const key = this.title ?? this.question;

		const displayValue = this.#applyCustomSummaryFormatter({
			answer,
			formattedAnswer,
			question: this,
			journey,
			sectionSegment
		});

		return [{ key, value: displayValue, action }];
	}

	/**
	 * Returns the action link for the question
	 */
	getAction(sectionSegment: string, journey: Journey, answer: unknown): ActionView | ActionView[] | undefined {
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

	format(answer: unknown): unknown {
		return answer;
	}

	/**
	 * Formats an answer value for display in the summary.
	 * Subclasses can override this to provide custom formatting without
	 * needing to override the full formatAnswerForSummary method.
	 */
	formatAnswer(answer: unknown): string {
		let formatted = (answer as string | null) ?? this.notStartedText;
		if (this.capitaliseAnswer) {
			formatted = capitalize(formatted);
		}
		return nl2br(escape(formatted));
	}

	isRequired() {
		return this.validators?.some((validator) => validator.isRequired());
	}

	fieldIsRequired(inputField: string) {
		return this.validators?.some(
			(item) => item instanceof MultiFieldInputValidator && item.inputFieldIsRequired(inputField)
		);
	}

	/**
	 * @param journeyResponse
	 * @param [fieldName] optional fieldname for multi field input questions
	 */
	isAnswered(journeyResponse: JourneyResponse, fieldName: string = this.fieldName): boolean {
		return !!journeyResponse.answers[fieldName];
	}
}
