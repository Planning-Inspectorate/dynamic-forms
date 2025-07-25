import { Question } from '../../questions/question.js';
import escape from 'escape-html';
import { nl2br } from '../../lib/utils.js';

/**
 * @typedef {import('../../questions/question.js').QuestionViewModel} QuestionViewModel
 * @typedef {import('../../journey/journey.js').Journey} Journey
 * @typedef {import('../../journey/journey-response.js').JourneyResponse} JourneyResponse
 * @typedef {import('../../section').Section} Section
 * @typedef {import('../../validator/base-validator')} BaseValidator
 */

/**
 * @typedef {Object} Suffix
 * @property {string} text
 * @property {string} [classes] optional property, used to add classes to the suffix/prefix
 */

/**
 * @typedef {Object} InputField
 * @property {string} fieldName
 * @property {string} label
 * @property {string} [formatJoinString] optional property, used by formatAnswerForSummary (eg task list display), effective default to line break
 * @property {string} [formatPrefix] optional property, used by formatAnswerForSummary (eg task list display), to prefix answer
 * @property {function} [formatTextFunction] optional property, used to format the answer for display and value in question
 * @property {Record<string, string>} [attributes] optional property, used to add html attributes to the field
 * @property {Suffix} [suffix] optional property, used to add a suffix to the field
 * @property {Suffix} [prefix] optional property, used to add a prefix to the field
 */

/**
 * @class
 */
export default class MultiFieldInputQuestion extends Question {
	/** @type {Record<string, string>} */
	inputAttributes;

	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
	 * @param {Record<string, string>} [params.inputAttributes] html attributes to add to the input
	 * @param {InputField[]} params.inputFields input fields
	 */
	constructor({ label, inputAttributes = {}, inputFields, ...params }) {
		super({
			...params,
			viewFolder: 'multi-field-input'
		});
		this.label = label;
		this.inputAttributes = inputAttributes;

		if (inputFields) {
			this.inputFields = inputFields;
		} else {
			throw new Error('inputFields are mandatory');
		}
	}

	prepQuestionForRendering(section, journey, customViewData, payload) {
		let viewModel = super.prepQuestionForRendering(section, journey, customViewData);

		const inputFields = this.inputFields.map((inputField) => {
			return payload
				? { ...inputField, value: this.#formatValue(payload[inputField.fieldName], inputField.formatTextFunction) }
				: {
						...inputField,
						value: this.#formatValue(journey.response.answers[inputField.fieldName], inputField.formatTextFunction)
					};
		});

		viewModel.question.inputFields = inputFields;
		viewModel.question.label = this.label;
		viewModel.question.attributes = this.inputAttributes;
		return viewModel;
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

		for (const inputField of this.inputFields) {
			responseToSave.answers[inputField.fieldName] = req.body[inputField.fieldName]?.trim();
			journeyResponse.answers[inputField.fieldName] = responseToSave.answers[inputField.fieldName];
		}

		return responseToSave;
	}

	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @param {Journey} journey
	 * @param {String} sectionSegment
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
	formatAnswerForSummary(sectionSegment, journey) {
		const summaryDetails = this.inputFields.reduce((acc, field) => {
			const answer = this.#formatValue(journey.response.answers[field.fieldName], field.formatTextFunction);
			return answer ? acc + (field.formatPrefix || '') + answer + (field.formatJoinString || '\n') : acc;
		}, '');

		const formattedAnswer = this.#allQuestionsUnanswered(journey) ? this.notStartedText : summaryDetails || '';

		return [
			{
				key: `${this.title}`,
				value: nl2br(escape(formattedAnswer)),
				action: this.getAction(sectionSegment, journey, summaryDetails)
			}
		];
	}

	/**
	 * checks whether any answers have been provided for input field questions
	 * @param {Journey} journey
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
