import { Question } from '../../questions/question.ts';
import { Uuid } from '../../lib/uuid.ts';
import nunjucks from 'nunjucks';
import { MANAGE_LIST_ACTIONS } from './manage-list-actions.ts';
import type { Section } from '../../section.ts';
import type { Request, Response } from 'express';
import type { JourneyResponse } from '../../journey/journey-response.ts';
import type { ManageListQuestionParams } from '../../types/question-props.ts';
import type { QuestionViewModel } from '../../types/question-types.ts';
import type { Journey } from '../../journey/journey.ts';

export class ManageListQuestion extends Question {
	#section: Section | undefined;
	readonly #showAnswersInSummary: boolean;
	readonly #confirmationQuestionParam: string;

	constructor(params: ManageListQuestionParams) {
		super({
			...params,
			pageTitle: params.title,
			viewFolder: 'manage-list',
			viewData: {
				...params.viewData,
				titleSingular: params.titleSingular,
				showManageListQuestions: params.showManageListQuestions
			}
		});
		this.#showAnswersInSummary = params.showAnswersInSummary || false;
		this.#confirmationQuestionParam = params.confirmationQuestion || 'confirm';
	}

	/**
	 * Is this question a manage list question?
	 *
	 * Used by controller and other logic.
	 * Added as a getter so custom components can also be a manage list question.
	 */
	get isManageListQuestion() {
		return true;
	}

	get confirmationQuestionParam() {
		return this.#confirmationQuestionParam;
	}

	addCustomDataToViewModel(viewModel: QuestionViewModel) {
		viewModel.question.addAnotherLink = this.#addAnotherLink;
		viewModel.question.firstQuestionUrl = this.#firstQuestionUrl;
		viewModel.question.valueSummary = [];
		viewModel.actionParams = {
			edit: MANAGE_LIST_ACTIONS.EDIT,
			remove: MANAGE_LIST_ACTIONS.REMOVE,
			confirmRemove: this.#confirmationQuestionParam
		};
		if (viewModel.question.value && Array.isArray(viewModel.question.value)) {
			viewModel.question.valueSummary = viewModel.question.value.map((v) => {
				return {
					id: v.id,
					value: this.#formatItemAnswers(v)
				};
			});
		}
	}

	/**
	 * Format the answers to each of the manage list questions
	 */
	#formatItemAnswers(answer: { id: string; [k: string]: string }) {
		if (this.section.questions.length === 0) {
			return [];
		}
		const response = {
			answers: answer
		};
		// enough of a journey for display logic to work
		const mockJourney = {
			getCurrentQuestionUrl() {},
			responseForSection() {
				// this function is already passed the array-item
				// call to formatAnswerForSummary may use responseForSection so we implement here
				return response;
			},
			response
		} as unknown as Journey;
		return (
			this.section.questions
				// only show questions which should be displayed based on any conditional logic
				.filter((q) => q.shouldDisplay(mockJourney.response))
				.map((q) => {
					const formatted = q
						.formatAnswerForSummary('', mockJourney, answer[q.fieldName])
						.map((a) => a.value)
						.join(', ');

					return {
						question: q.title,
						answer: formatted
					};
				})
		);
	}

	async getDataToSave(req: Request, journeyResponse: JourneyResponse) {
		return {
			answers: {
				[this.fieldName]: journeyResponse.answers[this.fieldName] || []
			}
		};
	}

	/**
	 * Format the answer for display in the summary, either as a count or as a list of answers
	 */
	formatAnswer(answer: unknown) {
		if (!answer || !Array.isArray(answer)) {
			return this.notStartedText;
		}

		if (this.#showAnswersInSummary) {
			const answers = answer.map((a) => this.#formatItemAnswers(a));
			// note: nunjucks.render uses the last configured environment
			// so we assume here that it is the one used by the main application and
			// is configured for dynamic-forms and govuk components
			return nunjucks.render('components/manage-list/answer-summary-list.njk', { answers });
		}

		if (answer.length > 0) {
			return `${answer.length} ${this.title}`;
		}

		return this.notStartedText;
	}

	renderConfirmationAction(
		res: Response,
		itemToRemove: { id: string; [k: string]: string },
		viewModel: QuestionViewModel
	) {
		viewModel.questionSummary = this.#formatItemAnswers(itemToRemove);
		let view = `components/${this.viewFolder}/${this.confirmationQuestionParam}`;
		if (this.viewFolder.includes('/')) {
			// custom view folder
			view = `${this.viewFolder}/${this.confirmationQuestionParam}`;
		}
		res.render(view, viewModel);
	}

	/**
	 * Create an 'add another' link,
	 * to the first question in the manage list section
	 */
	get #addAnotherLink() {
		if (this.section.questions.length === 0) {
			return '';
		}
		const nextItemId = Uuid.randomUUID();
		const firstQuestion = this.#firstQuestionUrl;
		return `add/${nextItemId}/${firstQuestion}`;
	}

	/**
	 * First question URL
	 */
	get #firstQuestionUrl() {
		if (this.section.questions.length === 0) {
			return '';
		}
		return this.section.questions[0].url;
	}

	get section() {
		if (!this.#section) {
			throw new Error('manage list section not set');
		}
		return this.#section;
	}

	set section(section: Section) {
		this.#section = section;
	}
}

export default ManageListQuestion;
