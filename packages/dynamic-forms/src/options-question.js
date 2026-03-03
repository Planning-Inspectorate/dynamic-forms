const nunjucks = require('nunjucks');
const Question = require('./question');
const ValidOptionValidator = require('./validator/valid-option-validator');
const {
	getConditionalFieldName,
	optionIsDivider,
	conditionalIsJustHTML
} = require('./dynamic-components/utils/question-utils');

const defaultOptionJoinString = ',';

/**
 * @typedef {import('./question').QuestionViewModel} QuestionViewModel
 * @typedef {import('./journey').Journey} Journey
 * @typedef {import('./journey-response').JourneyResponse} JourneyResponse
 * @typedef {import('./section').Section} Section
 * @typedef {import('./question-props').Option} Option
 * @typedef {import('./question-props').OptionWithoutDivider} OptionWithoutDivider
 */

/**
 * @typedef {QuestionViewModel & { question: QuestionViewModel['question'] & { options?: Option[] } }} OptionsViewModel
 */

class OptionsQuestion extends Question {
	/** @type {Array<Option>} */
	options;

	/**
	 * @param {Object} params
	 * @param {string} params.title
	 * @param {string} params.question
	 * @param {string} params.viewFolder
	 * @param {string} params.fieldName
	 * @param {string} [params.url]
	 * @param {string} [params.hint]
	 * @param {string} [params.pageTitle]
	 * @param {string} [params.description]
	 * @param {Array<Option>} [params.options]
	 * @param {Array<string>} [params.variables]
	 * @param {Array<import('./question').BaseValidator>} [params.validators]
	 *
	 * @param {Record<string, Function>} [methodOverrides]
	 */
	constructor(params, methodOverrides) {
		// add default valid options validator to all options questions
		let optionsValidators = [new ValidOptionValidator()];
		if (params.validators && Array.isArray(params.validators)) {
			optionsValidators = params.validators.concat(optionsValidators);
		}

		super(
			{
				...params,
				validators: optionsValidators
			},
			methodOverrides
		);
		this.hint = params.hint;
		this.options = params.options || [];
		this.optionJoinString = defaultOptionJoinString;
	}

	/**
	 * gets the view model for this question
	 * @param {Object} options - the current section
	 * @param {Section} options.section - the current section
	 * @param {Journey} options.journey - the journey we are in
	 * @param {Record<string, unknown>} [options.customViewData] additional data to send to view
	 * @param {Record<string, unknown>} [options.payload]
	 * @param {string} [options.sessionBackLink]
	 * @returns {OptionsViewModel}
	 */
	prepQuestionForRendering({ section, journey, customViewData, payload, sessionBackLink }) {
		const answer = payload
			? payload[this.fieldName]
			: journey.response.answers[this.fieldName] || '';

		/** @type {OptionsViewModel} */
		const viewModel = super.prepQuestionForRendering({
			section,
			journey,
			customViewData,
			payload,
			sessionBackLink
		});
		viewModel.question.options = [];

		for (const option of this.options) {
			let unformattedOptionData = { ...option };

			const optionData = super.replaceVariables(section, unformattedOptionData);

			// Skip if the option is a divider
			if (optionIsDivider(optionData)) {
				viewModel.question.options.push(optionData);
				continue;
			}

			if (optionData.value !== undefined) {
				optionData.checked = (',' + answer + ',').includes(',' + optionData.value + ',');
				if (!optionData.attributes) {
					optionData.attributes = { 'data-cy': 'answer-' + optionData.value };
				}
			}

			// handle conditional (dependant) fields & set their answers
			if (optionData.conditional !== undefined) {
				if (conditionalIsJustHTML(optionData.conditional)) continue;

				let conditionalField = { ...optionData.conditional };

				conditionalField.fieldName = getConditionalFieldName(
					this.fieldName,
					conditionalField.fieldName
				);
				conditionalField.value = payload
					? payload[conditionalField.fieldName]
					: journey.response.answers[conditionalField.fieldName] || '';

				optionData.conditional = {
					html: nunjucks.render(`./dynamic-components/conditional/${conditionalField.type}.njk`, {
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
	 * @typedef ConditionalAnswerObject
	 * @type {object}
	 * @property {string} value the checkbox answer
	 * @property {string} conditional the conditional text input
	 */

	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @param {String} sectionSegment
	 * @param {import('./journey').Journey} journey
	 * @param {string | OptionWithoutDivider | ConditionalAnswerObject | null} answer
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
		if (!answer) {
			return super.formatAnswerForSummary(sectionSegment, journey, answer, capitals);
		}

		//would only apply if particular answer has conditional
		if (typeof answer !== 'string') {
			/** @type {import('src/dynamic-forms/question-props').OptionWithoutDivider | undefined} */
			// @ts-ignore
			const selectedOption = this.options.find(
				(option) => !optionIsDivider(option) && option.value === answer.value
			);

			if (
				!selectedOption ||
				conditionalIsJustHTML(selectedOption.conditional) ||
				optionIsDivider(selectedOption)
			)
				throw new Error('Answer did not correlate with a valid option');

			const conditionalAnswerText = selectedOption.conditional?.label
				? `${selectedOption.conditional.label} ${answer.conditional}`
				: answer.conditional;

			const formattedAnswer = [selectedOption.text, conditionalAnswerText].join('\n');

			return super.formatAnswerForSummary(sectionSegment, journey, formattedAnswer, false);
		}

		const answerArray = answer.split(this.optionJoinString);

		const formattedAnswer = this.options
			.filter((option) => !optionIsDivider(option) && answerArray.includes(option.value))
			.map(
				// @ts-ignore
				(/** @type {import('src/dynamic-forms/question-props').OptionWithoutDivider} */ option) => {
					if (option.conditional) {
						if (conditionalIsJustHTML(option.conditional)) return '';
						const conditionalAnswer =
							journey.response.answers[
								getConditionalFieldName(this.fieldName, option.conditional.fieldName)
							];
						return [option.text, conditionalAnswer].join('\n');
					}

					return option.text;
				}
			)
			.join('\n');

		return super.formatAnswerForSummary(sectionSegment, journey, formattedAnswer, capitals);
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

		/** @type {string[]} */
		const fields = Array.isArray(req.body[this.fieldName])
			? req.body[this.fieldName]
			: [req.body[this.fieldName]];
		const fieldValues = fields.map((x) => x?.trim());

		/** @type {OptionWithoutDivider[]} */
		// @ts-ignore
		const selectedOptions = this.options.filter((option) => {
			return !optionIsDivider(option) && fieldValues.includes(option.value);
		});

		responseToSave.answers[this.fieldName] = fieldValues.join(this.optionJoinString);
		journeyResponse.answers[this.fieldName] = fieldValues;

		this.options.forEach((option) => {
			if (optionIsDivider(option)) return;
			if (!option.conditional || conditionalIsJustHTML(option.conditional)) return;
			const key = getConditionalFieldName(this.fieldName, option.conditional.fieldName);
			const optionIsSelectedOption = selectedOptions.some(
				(selectedOption) =>
					option.text === selectedOption.text && option.value === selectedOption.value
			);

			const value = optionIsSelectedOption ? req.body[key]?.trim() : null;
			responseToSave.answers[key] = value;
			journeyResponse.answers[key] = value;
		});

		return responseToSave;
	}
}

module.exports = { OptionsQuestion };
