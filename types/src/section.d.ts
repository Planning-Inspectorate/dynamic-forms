/**
 * A value indicating the final question of a section has been reached
 *
 * @type {Symbol}
 */
export const END_OF_SECTION: Symbol;
/**
 * Defines a section for a questionnaire, a set of Questions
 * @class
 */
export class Section {
	/**
	 * Implementation of getNextQuestion given a list of questions
	 *
	 * @param {import('./section-types.d.ts').StaticGetNextQuestionParams} params
	 * @returns {Question|Symbol|null}
	 */
	static getNextQuestion({
		questions,
		questionFieldName,
		response,
		takeNextQuestion,
		reverse
	}: import('./section-types.d.ts').StaticGetNextQuestionParams): Question | Symbol | null;
	/**
	 * creates an instance of a section
	 * @param {string} name
	 * @param {string} segment
	 */
	constructor(name: string, segment: string);
	/**
	 * @type {string} - the display name of the section shown to user
	 */
	name: string;
	/**
	 * @type {string} - the unique url segment for the section
	 */
	segment: string;
	/**
	 * @type {Array<Question>} - questions within the section
	 */
	questions: Array<Question>;
	/**
	 * Add a condition to all questions in this section
	 *
	 * @param {QuestionCondition} shouldIncludeSection
	 * @returns {Section}
	 */
	withSectionCondition(shouldIncludeSection: QuestionCondition): Section;
	/**
	 * Fluent API method for adding questions
	 * @param {import('#src/questions/question.js').Question} question
	 * @param {import('#src/components/manage-list/manage-list-section.js').ManageListSection} [manageListSection]
	 * @returns {Section}
	 */
	addQuestion(
		question: import('#src/questions/question.js').Question,
		manageListSection?: import('#src/components/manage-list/manage-list-section.js').ManageListSection
	): Section;
	/**
	 * Fluent API method for attaching conditions to the previously added question
	 * @param {QuestionCondition} shouldIncludeQuestion
	 * @returns {Section}
	 */
	withCondition(shouldIncludeQuestion: QuestionCondition): Section;
	withRequiredCondition(isQuestionMandatory: any, requiredFieldErrorMsg: any): this;
	/**
	 * Fluent API method for starting a multi question condition
	 * @param {string} conditionName
	 * @param {QuestionCondition} shouldIncludeQuestion
	 * @returns {Section}
	 */
	startMultiQuestionCondition(conditionName: string, shouldIncludeQuestion: QuestionCondition): Section;
	/**
	 * Fluent API method for ending a multi question condition
	 * @param {string} conditionName
	 * @returns {Section}
	 */
	endMultiQuestionCondition(conditionName: string): Section;
	/**
	 * Get the next question in this section given a questionParam (question fieldName)
	 * @param {import('./section-types.d.ts').GetNextQuestionParams} params
	 * @returns {Question|Symbol|null}
	 */
	getNextQuestion(params: import('./section-types.d.ts').GetNextQuestionParams): Question | Symbol | null;
	/**
	 * checks answers on response to ensure that a answer is provided for each required question in the section
	 * @param {JourneyResponse} journeyResponse
	 * @returns {SectionStatus}
	 */
	getStatus(journeyResponse: JourneyResponse): SectionStatus;
	/**
	 * checks answers on response and return true if the status of the section is complete
	 * @param {JourneyResponse} journeyResponse
	 * @returns {boolean}
	 */
	isComplete(journeyResponse: JourneyResponse): boolean;
	#private;
}
export type SECTION_STATUS = SectionStatus;
/**
 * @typedef {string} SectionStatus
 */
/**
 * @enum {SectionStatus}
 */
export const SECTION_STATUS: Readonly<{
	NOT_STARTED: 'Not started';
	IN_PROGRESS: 'In progress';
	COMPLETE: 'Completed';
}>;
export type Question = any;
export type JourneyResponse = any;
export type QuestionCondition = (response: JourneyResponse) => boolean;
export type SectionStatus = string;
//# sourceMappingURL=section.d.ts.map
