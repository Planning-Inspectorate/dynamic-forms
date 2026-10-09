import { Question } from '../../questions/question.ts';
import escape from 'escape-html';
import { capitalize, nl2br } from '../../lib/utils.ts';
import type { MultiFieldInputQuestionParams } from '../../types/question-props.ts';
import type { Request } from 'express';
import type { JourneyResponse } from '../../journey/journey-response.ts';
import type { Journey } from '../../journey/journey.ts';
import type { SummaryRow } from '../../types/question-types.ts';

type InputField = MultiFieldInputQuestionParams['inputFields'][number];

export class MultiFieldInputQuestion extends Question {
	inputFields: MultiFieldInputQuestionParams['inputFields'];

	constructor({ inputFields, ...parentParams }: MultiFieldInputQuestionParams) {
		super({
			// default but allow overrides
			capitaliseAnswer: false,
			...parentParams,
			viewFolder: 'multi-field-input'
		});

		if (inputFields) {
			this.inputFields = inputFields;
		} else {
			throw new Error('inputFields are mandatory');
		}
	}

	/**
	 * Gets the body field names used by this question in form submissions.
	 */
	get bodyFieldNames() {
		return this.inputFields.map((inputField) => inputField.fieldName);
	}

	answerForViewModel(answers: Record<string, unknown>) {
		return this.inputFields.map((inputField) => {
			return {
				...inputField,
				value: this.#formatValue(answers[inputField.fieldName], inputField.formatTextFunction)
			};
		});
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 */
	async getDataToSave(req: Request) {
		const answers: Record<string, unknown> = {};

		for (const inputField of this.inputFields) {
			let value = req.body[inputField.fieldName];
			if (typeof value === 'string') {
				value = value.trim();
			}
			answers[inputField.fieldName] = value;
		}

		return { answers };
	}

	/**
	 * Formats an answer value for display in the summary.
	 * Handles the ManageListSection edge case where nl2br should not be applied.
	 */
	formatAnswer(answer: unknown) {
		// Only show notStartedText for null/undefined, not for empty string
		if (answer === null || answer === undefined) return this.notStartedText;
		if (answer === '') return '';

		// Coerce to string and apply optional capitalisation
		let formatted = String(answer);
		if (this.capitaliseAnswer) {
			formatted = capitalize(formatted);
		}

		// Do not convert new lines to breaks in ManageListSection, as this causes a "doubled up" <br>
		return this.isInManageListSection ? escape(formatted) : nl2br(escape(formatted));
	}

	/**
	 * returns the formatted answers values to be used to build task list elements
	 */
	formatAnswerForSummary(sectionSegment: string, journey: Journey): SummaryRow[] {
		// get the response/answers for the section we're in - which might be a dynamic section
		const response = journey.responseForSection(sectionSegment);
		// Handle unanswered case - delegate to parent for notStartedText
		if (this.#allQuestionsUnanswered(response)) {
			return super.formatAnswerForSummary(sectionSegment, journey, null);
		}

		// Default join string depends on context
		const defaultJoinString = this.isInManageListSection ? '\n' : '<br>';

		let summaryDetails = this.inputFields.reduce((accumulator, field) => {
			const rawAnswer = response.answers[field.fieldName];
			if (rawAnswer === undefined || rawAnswer === null || rawAnswer === '') return accumulator;

			const formatted = this.#formatFieldForSummary(rawAnswer, field, journey, sectionSegment);
			return accumulator + (field.formatPrefix || '') + formatted + (field.formatJoinString ?? defaultJoinString);
		}, '');

		// Remove trailing join string
		if (summaryDetails.endsWith(defaultJoinString)) {
			summaryDetails = summaryDetails.slice(0, -defaultJoinString.length);
		}

		// Apply question-level formatSummaryValue if provided
		const displayValue = this.formatSummaryValue
			? this.formatSummaryValue({
					answer: summaryDetails,
					formattedAnswer: summaryDetails,
					question: this,
					journey,
					sectionSegment
				})
			: summaryDetails;

		// Build result directly - escaping already handled per-field
		const action = this.getAction(sectionSegment, journey, summaryDetails);
		const key = this.title ?? this.question;
		return [{ key, value: displayValue || '', action }];
	}

	/**
	 * Formats a single field value for summary display
	 */
	#formatFieldForSummary(answer: unknown, field: InputField, journey: Journey, sectionSegment: string) {
		// Apply formatTextFunction (if provided) before escaping, same as answerForViewModel
		const textFormattedAnswer = this.#formatValue(answer, field.formatTextFunction);
		const formattedAnswer = escape(String(textFormattedAnswer));

		// If formatSummaryValue is provided, use it with full context (output is not escaped)
		if (typeof field.formatSummaryValue === 'function') {
			return field.formatSummaryValue({
				answer,
				formattedAnswer,
				question: this,
				journey,
				sectionSegment,
				field
			});
		}

		// Default: escaped, formatTextFunction-applied value
		return formattedAnswer;
	}

	/**
	 * checks whether any answers have been provided for input field questions
	 */
	#allQuestionsUnanswered(response: JourneyResponse) {
		return this.inputFields.every((field) => response.answers[field.fieldName] === undefined);
	}

	/**
	 * returns formated value/answer if formatting is provided (defaults to value provided)
	 */
	#formatValue(valueToFormat: unknown, formatTextFunction?: (text: string) => string) {
		if (typeof formatTextFunction === 'function' && valueToFormat) {
			return formatTextFunction(valueToFormat as string);
		}

		return valueToFormat;
	}
}

export default MultiFieldInputQuestion;
