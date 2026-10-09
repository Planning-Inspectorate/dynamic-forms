import nunjucks from 'nunjucks';
import { Question } from './question.ts';
import ValidOptionValidator from '../validator/valid-option-validator.ts';
import { getConditionalFieldName } from '../components/utils/question-utils.ts';
import { toArray } from '../lib/utils.ts';
import escape from 'escape-html';
import type { OptionsQuestionParams, Option, SelectableOption, DividerOption } from '../types/question-props.ts';
import type BaseValidator from '../validator/base-validator.ts';
import type { Section } from '../section.ts';
import type { Journey } from '../journey/journey.ts';
import type { PrepQuestionForRenderingOptions, QuestionViewModel } from '../types/question-types.ts';
import type { Request } from 'express';

const defaultOptionJoinString = ',';

export type SelectableOptionView = {
	text: string;
	value: string;
	hint?: object;
	checked?: boolean | undefined;
	selected?: boolean | undefined;
	attributes?: Record<string, string>;
	behaviour?: 'exclusive';
	conditional?: {
		html: string;
	};
};

export type OptionView = SelectableOptionView | DividerOption;

/**
 * Answers with conditional values, for example:
 * - Single value with conditional: { value: 'yes', conditional: { yes: 'details' } }
 * - Multiple values with conditionals: { value: 'yes,no', conditional: { yes: 'details1', no: 'details2' } }
 */
export type AnswerWithConditional =
	| string
	| {
			value: string;
			conditional: {
				[key: string]: string;
			};
	  };

export class OptionsQuestion extends Question {
	options: Option[];
	optionJoinString: string;

	constructor(params: OptionsQuestionParams & { viewFolder: string }) {
		// add default valid options validator to all options questions
		let optionsValidators: BaseValidator[] = [new ValidOptionValidator()];
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
	 */
	prepQuestionForRendering(
		section: Section,
		journey: Journey,
		customViewData?: Record<string, unknown>,
		payload?: Record<string, unknown>,
		options?: PrepQuestionForRenderingOptions
	): QuestionViewModel {
		const viewModel = super.prepQuestionForRendering(section, journey, customViewData, payload, options);
		const answers = payload || this.answerObjectFromJourneyResponse(journey.response, options);
		const answer = viewModel.question.value;

		const viewOptions: OptionView[] = [];

		for (const option of this.options) {
			if (!optionIsSelectable(option)) {
				viewOptions.push(option);
				continue;
			}
			const optionView: SelectableOptionView = { ...option, conditional: undefined };
			delete optionView.conditional;
			if (optionView.value !== undefined) {
				const selected = (',' + answer + ',').includes(',' + optionView.value + ',');
				// support checkboxes/radios
				optionView.checked = selected;
				// support selects
				optionView.selected = selected;
				if (!optionView.attributes) {
					optionView.attributes = { 'data-cy': 'answer-' + optionView.value };
				}
			}

			// handle conditional (dependant) fields & set their answers
			if (option.conditional !== undefined) {
				const conditionalField: Partial<SelectableOption['conditional']> = { ...option.conditional };

				conditionalField.fieldName = getConditionalFieldName(this.fieldName, conditionalField.fieldName!);
				conditionalField.value = answers[conditionalField.fieldName] || '';

				optionView.conditional = {
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
			if (option.conditionalText !== undefined) {
				optionView.conditional = option.conditionalText;
			}

			viewOptions.push(optionView);
		}
		viewModel.question.options = viewOptions;

		return viewModel;
	}

	/**
	 * Formats an answer value for display in the summary.
	 * Looks up the option text for the given value(s).
	 */
	formatAnswer(answer: unknown) {
		if (!answerIsConditional(answer)) {
			return this.notStartedText;
		}

		const answerValues = String(answer)
			.split(this.optionJoinString)
			.map((value) => value.trim());
		const texts = answerValues.map((value) => {
			const option = this.options.filter(optionIsSelectable).find((opt) => opt.value === value);
			return escape(option ? option.text : value);
		});

		return texts.join('<br>');
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 */
	async getDataToSave(req: Request) {
		const answers: Record<string, unknown> = {};

		const fields = req.body[this.fieldName] !== undefined ? toArray(req.body[this.fieldName]) : [];
		const fieldValues = fields.map((x) => x.trim());

		const selectedOptions = this.options.filter(optionIsSelectable).filter(({ value }) => {
			return fieldValues.includes(value);
		});

		if (selectedOptions.length !== fieldValues.length)
			throw new Error(`User submitted option(s) did not correlate with valid answers to ${this.fieldName} question`);

		// TODO DF-51 treat as an array
		answers[this.fieldName] = fieldValues.join(this.optionJoinString);

		this.options.forEach((option) => {
			if (!optionIsSelectable(option)) {
				return;
			}
			if (!option.conditional) return;
			const key = getConditionalFieldName(this.fieldName, option.conditional.fieldName);
			const optionIsSelectedOption = selectedOptions.some(
				(selectedOption) => option.text === selectedOption.text && option.value === selectedOption.value
			);

			answers[key] = optionIsSelectedOption ? req.body[key]?.trim() : null;
		});

		return { answers };
	}

	/**
	 * Get an option by its value, which by definition cannot be a DividerOption, so this gives a narrow type
	 * than just calling `options.find`
	 *
	 * @param value
	 */
	optionByValue(value: string) {
		return this.options.find((opt) => optionIsSelectable(opt) && opt.value === value) as SelectableOption | undefined;
	}
}

export function optionIsSelectable(option: Option): option is SelectableOption {
	return 'text' in option;
}

export function answerIsConditional(answer: unknown): answer is AnswerWithConditional {
	return answer !== null && answer !== undefined && answer !== '';
}

export default OptionsQuestion;
