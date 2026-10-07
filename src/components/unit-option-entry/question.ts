import nunjucks from 'nunjucks';
import type { QuestionMethodOverrides } from '../../questions/question.ts';
import { Question } from '../../questions/question.ts';
import { conditionalIsJustHTML } from '../utils/question-utils.ts';
import { toArray } from '#src/lib/utils.ts';
import type { Request } from 'express';
import type { Journey } from '#journey';
import type { Section } from '#section';
import type { UnitOptionEntryQuestionParams } from '#typedefs/question-props.ts';
import type {
	BaseQuestionViewData,
	PrepQuestionForRenderingOptions,
	QuestionViewModel
} from '#typedefs/question-types.ts';

const defaultOptionJoinString = ',';

/**
 * UnitOptions are the options displayed in the radio format - in this case the value
 * represents the unit.
 * Conditionals must be used to capture the relevant quantity.
 * Each conditional must have a fieldName which uses the conditionalFieldName from the
 * UnitOptionEntryQuestion object as a base, followed by an underscore and unit reference
 * eg 'siteAreaSquareMetres_hectares' - this is required for validation and saving to the DB
 */
type UnitOption = {
	text: string;
	value: string;
	hint?: object;
	checked?: boolean | undefined;
	attributes?: Record<string, string>;
	behaviour?: 'exclusive';
	conditional: {
		fieldName: string;
		suffix: string;
		value?: unknown;
		label?: string;
		hint?: string;
		conversionFactor?: number;
	};
};

export type UnitOptionView = Omit<UnitOption, 'conditional'> & {
	conditional?: { html: string };
};

export type UnitOptionQuestionViewModel = BaseQuestionViewData & {
	options: UnitOptionView[];
};

export class UnitOptionEntryQuestion extends Question {
	options: UnitOption[];
	conditionalFieldName: string;
	label?: string;
	optionJoinString: string;

	constructor(
		{ conditionalFieldName, options, label, ...parentParams }: UnitOptionEntryQuestionParams,
		methodOverrides?: QuestionMethodOverrides
	) {
		super(
			{
				// Prevent capitalisation of answers, but allow override
				capitaliseAnswer: false,
				...parentParams,
				viewFolder: 'unit-option-entry'
			},
			methodOverrides
		);

		if (!options?.length) throw new Error('Options is mandatory');
		if (!conditionalFieldName?.length) throw new Error('conditionalFieldName is mandatory');

		this.conditionalFieldName = conditionalFieldName;
		this.options = options as UnitOption[];
		this.label = label;
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
	): QuestionViewModel<UnitOptionQuestionViewModel> {
		const viewModel = super.prepQuestionForRendering(
			section,
			journey,
			customViewData,
			payload,
			options
		) as QuestionViewModel<UnitOptionQuestionViewModel>;
		const answer = viewModel.question.value;
		const answers = this.answerObjectFromJourneyResponse(journey.response, options);

		viewModel.question.options = [];
		const optionViews: UnitOptionView[] = [];

		for (const option of this.options) {
			const optionData = { ...option, conditional: undefined } as UnitOptionView;
			if (optionData.value !== undefined) {
				optionData.checked = (',' + answer + ',').includes(',' + optionData.value + ',');
				if (!optionData.attributes) {
					optionData.attributes = { 'data-cy': 'answer-' + optionData.value };
				}
			}

			// handle conditional (dependant) fields & set their answers
			if (option.conditional !== undefined) {
				const conditionalField = { ...option.conditional };

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

			optionViews.push(optionData);
		}
		viewModel.question.options = optionViews;

		return viewModel;
	}

	/**
	 * Get the data to save from the request, returns an object of answers
	 */
	async getDataToSave(req: Request) {
		const answers: Record<string, unknown> = {};

		const fields: string[] = toArray(req.body[this.fieldName]);
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
	 */
	formatAnswerForSummary(sectionSegment: string, journey: Journey, answer: unknown) {
		if (answer == null) return super.formatAnswerForSummary(sectionSegment, journey, answer);

		const selectedOption = this.options.find((option) => option.value === answer);
		const conversionFactor =
			(!conditionalIsJustHTML(selectedOption?.conditional) && selectedOption?.conditional.conversionFactor) || 1;
		// get the response/answers for the section we're in - which might be a dynamic section
		const response = journey.responseForSection(sectionSegment);
		const unconvertedAnswer = response.answers[this.conditionalFieldName];

		const answerQuantity = Number(unconvertedAnswer) / conversionFactor;
		if (isNaN(answerQuantity)) throw new Error('Conditional answer had an unexpected type');

		const formattedAnswer = `${answerQuantity} ${answer}`;
		return super.formatAnswerForSummary(sectionSegment, journey, formattedAnswer);
	}
}

export default UnitOptionEntryQuestion;
