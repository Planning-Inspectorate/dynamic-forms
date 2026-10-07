import escape from 'escape-html';
import OptionsQuestion, { answerIsConditional } from '../../questions/options-question.ts';
import type { RadioQuestionParams } from '#typedefs/question-props.ts';
import type { QuestionViewModel } from '#typedefs/question-types.ts';

export class RadioQuestion extends OptionsQuestion {
	label?: string;
	legend?: string;

	constructor({ label, html, legend, viewFolder, ...parentParams }: RadioQuestionParams) {
		super({
			...parentParams,
			viewFolder: viewFolder || 'radio'
		});

		this.html = html;
		this.label = label;
		this.legend = legend;
	}

	addCustomDataToViewModel(viewModel: QuestionViewModel) {
		viewModel.question.label = this.label;
		viewModel.question.legend = this.legend;
	}

	/**
	 * Formats an answer value for display in the summary.
	 * Handles object answers with conditional fields (e.g. { value: 'yes', conditional: { yes: 'details' } })
	 */
	formatAnswer(answer: unknown) {
		if (!answerIsConditional(answer)) {
			return this.notStartedText;
		}

		// Handle simple string answers
		if (typeof answer !== 'object' || answer.value === undefined) {
			return super.formatAnswer(answer);
		}

		// Handle object answers with conditional fields
		const option = this.optionByValue(answer.value);
		const optionText = escape(option ? option.text : answer.value);

		const conditionalValue = answer.conditional?.[answer.value];
		if (conditionalValue) {
			const label = option?.conditional?.label ? `${escape(option.conditional.label)} ` : '';
			return `${optionText}<br>${label}${escape(conditionalValue)}`;
		}
		return optionText;
	}
}

export default RadioQuestion;
