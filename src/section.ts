import RequiredValidator from './validator/required-validator.ts';
import { answerObjectForListItem } from '#src/lib/answer-utils.ts';
import type { Question, QuestionCondition } from '#src/questions/question.ts';
import type { JourneyResponse } from '#src/journey/journey-response.ts';
import type { ManageListSection } from '#src/components/manage-list/manage-list-section.ts';
import type ManageListQuestion from '#src/components/manage-list/question.ts';
import type { GetNextQuestionParams, StaticGetNextQuestionParams } from '#typedefs/section-types.ts';
import type MultiFieldInputQuestion from '#src/components/multi-field-input/question.ts';
import type { DynamicSection } from '#src/dynamic-section.ts';

/**
 * A value indicating the final question of a section has been reached
 */
export const END_OF_SECTION = Symbol('END_OF_SECTION');

/**
 * Defines a section for a questionnaire, a set of Questions
 * @class
 */
export class Section {
	/** the display name of the section shown to user */
	name: string;

	/** the unique url segment for the section */
	segment: string;

	/** questions within the section */
	questions: Question[] = [];

	/** if a condition has just been added ensure a question is added before the next condition */
	#conditionAdded: boolean = false;

	/** A condition to apply to every question in this section */
	#sectionCondition: QuestionCondition | null = null;

	/** conditions to apply to a set of questions, until ended is true */
	#multiQuestionConditions: Record<string, { ended: boolean; condition: QuestionCondition }> = {};

	constructor(name: string, segment: string) {
		this.name = name;
		this.segment = segment;
	}

	/**
	 * Is this section dynamic?
	 *
	 * Implemented as a getter so dynamic section can override it,
	 * but it cannot be changed at runtime.
	 */
	get isDynamicSection() {
		return false;
	}

	/**
	 * Add a condition to all questions in this section
	 */
	withSectionCondition(shouldIncludeSection: QuestionCondition) {
		if (this.questions.length > 0) {
			throw new Error('section conditions must be added before any questions');
		}
		if (typeof shouldIncludeSection !== 'function') {
			throw new Error('section condition must be a function');
		}
		if (this.#sectionCondition) {
			throw new Error('section condition already set');
		}
		this.#sectionCondition = shouldIncludeSection;
		return this;
	}

	/**
	 * Fluent API method for adding questions
	 */
	addQuestion(question: Question, manageListSection?: ManageListSection) {
		if (!question) {
			throw new Error('question is required');
		}
		if (question.isManageListQuestion) {
			if (!manageListSection || !manageListSection.isManageListSection) {
				throw new Error('manage list questions require a ManageListSection');
			}
			(question as ManageListQuestion).section = manageListSection;
		}
		this.questions.push(question);
		this.#conditionAdded = false; // reset condition flag
		this.#applyConditions(question);
		return this;
	}

	/**
	 * Apply conditions to the given question
	 */
	#applyConditions(question: Question, condition?: QuestionCondition) {
		const conditions: QuestionCondition[] = [];

		// any section based conditions first
		if (this.#sectionCondition) {
			conditions.push(this.#sectionCondition);
		}
		// any group conditions that are active
		// Q: does the order here matter?
		const groupConditions = Object.values(this.#multiQuestionConditions)
			.filter((group) => !group.ended)
			.map((group) => group.condition);
		conditions.push(...groupConditions);

		// add the specific condition for this question
		if (condition) {
			conditions.push(condition);
		}

		// combine all conditions into a single function
		question.shouldDisplay = (response) => conditions.every((condition) => condition(response));
	}

	/**
	 * Fluent API method for attaching conditions to the previously added question
	 */
	withCondition(shouldIncludeQuestion: QuestionCondition) {
		if (this.#conditionAdded) {
			// don't allow two conditions in a row
			throw new Error('conditions must follow a question');
		}
		this.#conditionAdded = true; // set condition flag
		const lastQuestionAdded = this.questions.length - 1;
		const question = this.questions[lastQuestionAdded];

		this.#applyConditions(question, shouldIncludeQuestion);
		return this;
	}

	withRequiredCondition(isQuestionMandatory: boolean, requiredFieldErrorMsg: string) {
		if (this.#conditionAdded) {
			// don't allow two conditions in a row
			throw new Error('conditions must follow a question');
		}
		this.#conditionAdded = true;
		const lastQuestionAdded = this.questions.length - 1;
		const validators = this.questions[lastQuestionAdded].validators;

		if (isQuestionMandatory) {
			if (!validators.some((validator) => validator instanceof RequiredValidator)) {
				validators.push(new RequiredValidator(requiredFieldErrorMsg));
			}
		} else {
			this.questions[lastQuestionAdded].validators = validators.filter(
				(validator) => !(validator instanceof RequiredValidator)
			);
		}

		return this;
	}

	/**
	 * Fluent API method for starting a multi question condition
	 */
	startMultiQuestionCondition(conditionName: string, shouldIncludeQuestion: QuestionCondition) {
		if (this.#multiQuestionConditions[conditionName]) {
			throw new Error('group condition already started');
		}
		this.#multiQuestionConditions[conditionName] = { ended: false, condition: shouldIncludeQuestion };
		return this;
	}

	/**
	 * Fluent API method for ending a multi question condition
	 */
	endMultiQuestionCondition(conditionName: string) {
		if (!this.#multiQuestionConditions[conditionName]) {
			throw new Error('group condition not started');
		}
		this.#multiQuestionConditions[conditionName].ended = true;
		return this;
	}

	/**
	 * Get the next question in this section given a questionParam (question fieldName)
	 */
	getNextQuestion(params: GetNextQuestionParams): Question | symbol | null {
		const { response, manageListQuestion, routeParams } = params;
		if (manageListQuestion) {
			// first check if the next question is within the manage list section
			// here we get the answers for the manage list item for the question.shouldDisplay logic
			const answers = answerObjectForListItem(response, manageListQuestion, routeParams.manageListItemId);
			const next = Section.getNextQuestion({
				...params,
				response: { answers } as JourneyResponse,
				questions: manageListQuestion.section.questions
			});
			if (next === END_OF_SECTION) {
				// after the manage list section questions, go back to the manage list question
				return manageListQuestion;
			}
			return next;
		}
		const nextQuestionParams = {
			...params,
			questions: this.questions
		};
		if (this.isDynamicSection) {
			// for dynamic sections, the answers are within an array
			const section = this as unknown as DynamicSection;
			const answers = answerObjectForListItem(response, section, this.segment);
			nextQuestionParams.response = { answers } as JourneyResponse;
		}
		return Section.getNextQuestion(nextQuestionParams);
	}

	/**
	 * Implementation of getNextQuestion given a list of questions
	 */
	static getNextQuestion({
		questions,
		questionFieldName,
		response,
		takeNextQuestion = false,
		reverse = false
	}: StaticGetNextQuestionParams): Question | symbol | null {
		const numberOfQuestions = questions.length;

		const questionsStart = reverse ? numberOfQuestions - 1 : 0;
		for (let i = questionsStart; reverse ? i >= 0 : i < numberOfQuestions; reverse ? i-- : i++) {
			const question = questions[i];
			if (takeNextQuestion && question.shouldDisplay(response)) {
				return question;
			}

			if (question.fieldName === questionFieldName || question.url === questionFieldName) {
				takeNextQuestion = true;
			}
		}
		if (takeNextQuestion) {
			return END_OF_SECTION;
		}
		return null;
	}

	/**
	 * checks answers on response to ensure that a answer is provided for each required question in the section
	 */
	getStatus(journeyResponse: JourneyResponse) {
		let result: SECTION_STATUSES = SECTION_STATUS.NOT_STARTED;
		let requiredQuestionCount = 0;
		let requiredAnswerCount = 0;
		let answerCount = 0;

		// answers for this section may be within an array, for example dynamic sections
		const response = this.getResponse(journeyResponse);

		for (const question of this.questions) {
			if (!question.shouldDisplay(response)) {
				continue;
			}
			// if question is a multi field input question, check all fields
			if ((question as MultiFieldInputQuestion).inputFields) {
				for (const field of (question as MultiFieldInputQuestion).inputFields) {
					if (question.fieldIsRequired(field.fieldName)) {
						requiredQuestionCount++;
					}
					if (question.isAnswered(response, field.fieldName)) {
						answerCount++;
					}
					if (question.isAnswered(response, field.fieldName) && question.fieldIsRequired(field.fieldName)) {
						requiredAnswerCount++;
					}
				}
			} else {
				if (question.isRequired()) {
					requiredQuestionCount++;
				}

				if (question.isAnswered(response)) {
					answerCount++;
				}

				if (question.isAnswered(response) && question.isRequired()) {
					requiredAnswerCount++;
				}
			}
		}

		// any answer given
		if (answerCount > 0) {
			result = SECTION_STATUS.IN_PROGRESS;
		}

		// section is conditional, so no required questions
		// or all required questions complete
		if (requiredQuestionCount === 0 || requiredAnswerCount >= requiredQuestionCount) {
			result = SECTION_STATUS.COMPLETE;
		}

		return result;
	}

	/**
	 * Get the journey response (answers) for this section
	 * That is most often the root answers object
	 * For dynamic sections, it is an object within the configured array
	 */
	getResponse(journeyResponse: JourneyResponse): JourneyResponse {
		// if this is a dynamic section, answers are within an array
		// only answers within the dynamic section can be used for display logic
		if (this.isDynamicSection) {
			// this is not a JourneyResponse class, but is like it
			// DF-46 will likely replace usage of JourneyResponse with an interface
			const section = this as unknown as DynamicSection;
			return {
				answers: answerObjectForListItem(journeyResponse, section, this.segment)
			} as JourneyResponse;
		}
		return journeyResponse;
	}

	/**
	 * checks answers on response and return true if the status of the section is complete
	 */
	isComplete(journeyResponse: JourneyResponse) {
		return this.getStatus(journeyResponse) === SECTION_STATUS.COMPLETE;
	}

	//todo: taskList withCondition - i.e. evaluate whether question should be
	//included in taskList (summary list) or not. See also comment in Question class
	//constructor - should only evaluate if on task list view
}

export const SECTION_STATUS = Object.freeze({
	NOT_STARTED: 'Not started',
	IN_PROGRESS: 'In progress',
	COMPLETE: 'Completed'
});

export type SECTION_STATUSES = (typeof SECTION_STATUS)[keyof typeof SECTION_STATUS];
