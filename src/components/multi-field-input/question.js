import { Question } from '#question';
import escape from 'escape-html';
import { capitalize, nl2br } from '../../lib/utils.js';

/**
 * @class
 */
export class MultiFieldInputQuestion extends Question {
	/**
	 * @param {import('#typedefs/question-props.d.ts').MultiFieldInputQuestionParams} params
	 */
	constructor({ inputFields, ...parentParams }) {
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
	 * @returns {string[]}
	 */
	get bodyFieldNames() {
		return this.inputFields.map((inputField) => inputField.fieldName);
	}

	answerForViewModel(answers) {
		return this.inputFields.map((inputField) => {
			return {
				...inputField,
				value: this.#formatValue(answers[inputField.fieldName], inputField.formatTextFunction)
			};
		});
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 * @param {import('express').Request} req
	 * @param {import('#journey-response').JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise<{ answers: Record<string, unknown> }>}
	 */ //eslint-disable-next-line no-unused-vars -- journeyResponse kept for other questions to use
	async getDataToSave(req, journeyResponse) {
		const answers = {};

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
	 *
	 * @param {unknown} answer - the raw answer value (composed from multiple fields)
	 * @returns {string} the formatted answer for display
	 */
	formatAnswer(answer) {
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
	 * @param {string} sectionSegment
	 * @param {import('#journey').Journey} journey
	 * @returns {import('#typedefs/question-types.d.ts').SummaryRow[]}
	 */
	formatAnswerForSummary(sectionSegment, journey) {
		// Handle unanswered case - delegate to parent for notStartedText
		if (this.#allQuestionsUnanswered(journey)) {
			return super.formatAnswerForSummary(sectionSegment, journey, null);
		}

		// Default join string depends on context
		const defaultJoinString = this.isInManageListSection ? '\n' : '<br>';

		let summaryDetails = this.inputFields.reduce((accumulator, field) => {
			const rawAnswer = journey.response.answers[field.fieldName];
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
	 * @param {unknown} answer - the raw answer value
	 * @param {import('#typedefs/question-props.d.ts').InputField} field - the input field config
	 * @param {import('#journey').Journey} journey - the journey instance
	 * @param {string} sectionSegment - the section segment
	 * @returns {string}
	 */
	#formatFieldForSummary(answer, field, journey, sectionSegment) {
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
	 * @param {import('#journey').Journey} journey
	 * @returns {boolean}
	 */
	#allQuestionsUnanswered(journey) {
		return this.inputFields.every((field) => journey.response.answers[field.fieldName] === undefined);
	}

	/**
	 * returns formated value/answer if formatting is provided (defaults to value provided)
	 * @param {string} valueToFormat
	 * @param {function} [formatTextFunction]
	 * @returns {string}
	 *
	 */
	#formatValue(valueToFormat, formatTextFunction) {
		if (typeof formatTextFunction === 'function' && valueToFormat) {
			return formatTextFunction(valueToFormat);
		}

		return valueToFormat;
	}
}

export default MultiFieldInputQuestion;
