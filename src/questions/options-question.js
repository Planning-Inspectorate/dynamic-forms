import nunjucks from 'nunjucks';
import { Question } from './question.js';
import ValidOptionValidator from '../validator/valid-option-validator.js';
import { getConditionalFieldName } from '../components/utils/question-utils.js';

const defaultOptionJoinString = ',';

/**
 * @typedef {{
 *   text: string;
 *   value: string;
 *     hint?: object;
 *   checked?: boolean | undefined;
 *   attributes?: Record<string, string>;
 *   behaviour?: 'exclusive';
 *   conditional?: {
 *     question: string;
 *     type: string;
 *     fieldName: string;
 *         inputClasses?: string;
 *         html?: string;
 *     value?: unknown;
 *         label?: string;
 *         hint?: string
 *   };
 *     conditionalText?: {
 *       html: string;
 *   }
 *}} Option
 */

/**
 * @typedef {import('./question').QuestionViewModel & { question: { options: Option[] } }} OptionsViewModel
 */

export default class OptionsQuestion extends Question {
	/** @type {Array<Option>} */
	options;

	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {Array<Option>} params.options
	 */
	constructor(params) {
		// add default valid options validator to all options questions
		let optionsValidators = [new ValidOptionValidator()];
		if (params.validators && Array.isArray(params.validators)) {
			optionsValidators = params.validators.concat(optionsValidators);
		}

		super({
			...params,
			validators: optionsValidators
		});
		this.options = params.options;
		this.optionJoinString = defaultOptionJoinString;
	}

	/**
	 * gets the view model for this question
	 * @param {import('#section').Section} section - the current section
	 * @param {import('#journey').Journey} journey - the journey we are in
	 * @param {Record<string, unknown>} [customViewData] additional data to send to view
	 * @param {Record<string, unknown>} [payload]
	 * @param {import('#src/questions/question-types.d.ts').PrepQuestionForRenderingOptions} options
	 * @returns {import('./question').QuestionViewModel} QuestionViewModel
	 */
	prepQuestionForRendering(section, journey, customViewData, payload, options) {
		const viewModel = super.prepQuestionForRendering(section, journey, customViewData, payload, options);
		const answers = payload || this.answerObjectFromJourneyResponse(journey.response, options);
		const answer = viewModel.question.value;

		viewModel.question.options = [];

		for (const option of this.options) {
			let optionData = { ...option };
			if (optionData.value !== undefined) {
				const selected = (',' + answer + ',').includes(',' + optionData.value + ',');
				// support checkboxes/radios
				optionData.checked = selected;
				// support selects
				optionData.selected = selected;
				if (!optionData.attributes) {
					optionData.attributes = { 'data-cy': 'answer-' + optionData.value };
				}
			}

			// handle conditional (dependant) fields & set their answers
			if (optionData.conditional !== undefined) {
				let conditionalField = { ...optionData.conditional };

				conditionalField.fieldName = getConditionalFieldName(this.fieldName, conditionalField.fieldName);
				conditionalField.value = answers[conditionalField.fieldName] || '';

				optionData.conditional = {
					// note: nunjucks.render uses the last configured environment
					// so we assume here that it is the one used by the main application and
					// is configured for dynamic-forms and govuk components
					html: nunjucks.render(`./components/conditional/${conditionalField.type}.njk`, {
						payload,
						...conditionalField,
						...customViewData
					})
				};
			}

			// handles conditional text only - if using conditional question the use conditional field
			if (optionData.conditionalText !== undefined) {
				optionData.conditional = optionData.conditionalText;
			}

			viewModel.question.options.push(optionData);
		}

		return viewModel;
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 * @param {import('express').Request} req
	 * @param {import('../journey/journey-response.js').JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise<{ answers: Record<string, unknown> }>}
	 */ //eslint-disable-next-line no-unused-vars -- journeyResponse kept for other questions to use
	async getDataToSave(req, journeyResponse) {
		const answers = {};

		const fields = Array.isArray(req.body[this.fieldName]) ? req.body[this.fieldName] : [req.body[this.fieldName]];
		const fieldValues = fields.map((x) => x.trim());

		const selectedOptions = this.options.filter(({ value }) => {
			return fieldValues.includes(value);
		});

		if (!selectedOptions.length)
			throw new Error(`User submitted option(s) did not correlate with valid answers to ${this.fieldName} question`);

		answers[this.fieldName] = fieldValues.join(this.optionJoinString);

		this.options.forEach((option) => {
			if (!option.conditional) return;
			const key = getConditionalFieldName(this.fieldName, option.conditional.fieldName);
			const optionIsSelectedOption = selectedOptions.some(
				(selectedOption) => option.text === selectedOption.text && option.value === selectedOption.value
			);

			answers[key] = optionIsSelectedOption ? req.body[key]?.trim() : null;
		});

		return { answers };
	}
}
