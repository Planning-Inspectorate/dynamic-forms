import nunjucks from 'nunjucks';
import { Question } from '../../questions/question.js';
import { conditionalIsJustHTML } from '../utils/question-utils.js';

const defaultOptionJoinString = ',';

/**
 * UnitOptions are the options displayed in the radio format - in this case the value
 * represents the unit.
 * Conditionals must be used to capture the relevant quantity.
 * Each conditional must have a fieldName which uses the conditionalFieldName from the
 * UnitOptionEntryQuestion object as a base, followed by an underscore and unit reference
 * eg 'siteAreaSquareMetres_hectares' - this is required for validation and saving to the DB
 * @typedef {{
 *   text: string;
 *   value: string;
 *     hint?: object;
 *   checked?: boolean | undefined;
 *   attributes?: Record<string, string>;
 *   behaviour?: 'exclusive';
 *   conditional: {
 *     fieldName: string;
 *         suffix: string;
 *     value?: unknown;
 *         label?: string;
 *         hint?: string;
 *     conversionFactor?: number;
 *   }
 *}} UnitOption
 */

export default class UnitOptionEntryQuestion extends Question {
	/** @type {Array<UnitOption>} */
	options;

	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {string} [params.conditionalFieldName] // will be the quantity and is captured by the conditional in the options
	 * @param {string} [params.label]
	 * @param {Array.<UnitOption>} [params.options]
	 * @param {Record<string, Function>} [methodOverrides]
	 */
	constructor({ conditionalFieldName, options, label, ...params }, methodOverrides) {
		super(
			{
				...params,
				viewFolder: 'unit-option-entry'
			},
			methodOverrides
		);

		if (!options?.length) throw new Error('Options is mandatory');
		if (!conditionalFieldName?.length) throw new Error('conditionalFieldName is mandatory');

		this.conditionalFieldName = conditionalFieldName;
		this.options = options;
		this.label = label;
		this.optionJoinString = defaultOptionJoinString;
	}

	/**
	 * gets the view model for this question
	 * @param {import('../../section').Section} section - the current section
	 * @param {import('#journey').Journey} journey - the journey we are in
	 * @param {Record<string, unknown>} [customViewData] additional data to send to view
	 * @param {Record<string, unknown>} [payload]
	 * @param {import('#src/questions/question-types.d.ts').PrepQuestionForRenderingOptions} options
	 * @returns {import('#question').QuestionViewModel & {
	 *   question: import('#question').QuestionViewModel['question'] & {
	 *     options:UnitOption[]
	 *   }
	 * }}
	 */
	prepQuestionForRendering(section, journey, customViewData, payload, options) {
		const viewModel = super.prepQuestionForRendering(section, journey, customViewData, payload, options);
		const answer = viewModel.question.value;
		const answers = this.answerObjectFromJourneyResponse(journey.response, options);

		/** @type {Array<UnitOption>} */
		viewModel.question.options = [];

		for (const option of this.options) {
			let optionData = { ...option };
			if (optionData.value !== undefined) {
				optionData.checked = (',' + answer + ',').includes(',' + optionData.value + ',');
				if (!optionData.attributes) {
					optionData.attributes = { 'data-cy': 'answer-' + optionData.value };
				}
			}

			// handle conditional (dependant) fields & set their answers
			if (optionData.conditional !== undefined) {
				let conditionalField = { ...optionData.conditional };

				if (conditionalIsJustHTML(conditionalField)) continue;

				const conversionFactor = conditionalField.conversionFactor || 1;
				const unconvertedAnswer = answers[this.conditionalFieldName];

				const existingValue =
					answer === optionData.value && typeof unconvertedAnswer === 'number'
						? unconvertedAnswer / conversionFactor
						: '';

				conditionalField.value = payload ? payload[conditionalField.fieldName] : existingValue;

				optionData.conditional = {
					// note: nunjucks.render uses the last configured environment
					// so we assume here that it is the one used by the main application and
					// is configured for dynamic-forms and govuk components
					html: nunjucks.render(`./components/conditional/unit.njk`, {
						payload,
						...conditionalField,
						...customViewData
					})
				};
			}

			viewModel.question.options.push(optionData);
		}

		return viewModel;
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 * @param {import('express').Request} req
	 * @param {JourneyResponse} journeyResponse - current journey response, modified with the new answers
	 * @returns {Promise<{ answers: Record<string, unknown> }>}
	 */ //eslint-disable-next-line no-unused-vars -- journeyResponse kept for other questions to use
	async getDataToSave(req, journeyResponse) {
		const answers = {};

		/** @type {string[]} */
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
			const optionIsSelectedOption = selectedOptions.some(
				(selectedOption) => option.text === selectedOption.text && option.value === selectedOption.value
			);

			if (optionIsSelectedOption) {
				if (conditionalIsJustHTML(option.conditional)) return;
				const conversionFactor = option.conditional.conversionFactor || 1;
				answers[this.conditionalFieldName] = req.body[option.conditional.fieldName] * conversionFactor;
			}
		});

		return { answers };
	}

	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @type {Question['formatAnswerForSummary']}
	 */
	formatAnswerForSummary(sectionSegment, journey, answer) {
		if (answer == null) return super.formatAnswerForSummary(sectionSegment, journey, answer);

		const selectedOption = this.options.find((option) => option.value === answer);
		const conversionFactor =
			(!conditionalIsJustHTML(selectedOption?.conditional) && selectedOption?.conditional.conversionFactor) || 1;
		const unconvertedAnswer = journey.response.answers[this.conditionalFieldName];

		const answerQuantity = Number(unconvertedAnswer) / conversionFactor;
		if (isNaN(answerQuantity)) throw new Error('Conditional answer had an unexpected type');

		const formattedAnswer = `${answerQuantity} ${answer}`;
		return super.formatAnswerForSummary(sectionSegment, journey, formattedAnswer, false);
	}
}
