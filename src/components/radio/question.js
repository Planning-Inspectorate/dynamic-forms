import escape from 'escape-html';
import OptionsQuestion from '../../questions/options-question.js';

export class RadioQuestion extends OptionsQuestion {
	/**
	 * @param {import('#typedefs/question-props.d.ts').RadioQuestionParams} params
	 */
	constructor({ label, html, legend, viewFolder, ...parentParams }) {
		super({
			...parentParams,
			viewFolder: viewFolder || 'radio'
		});

		this.html = html;
		this.label = label;
		this.legend = legend;
	}

	/**
	 * @param {import('#typedefs/question-types.d.ts').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel) {
		viewModel.question.label = this.label;
		viewModel.question.legend = this.legend;
	}

	/**
	 * Formats an answer value for display in the summary.
	 * Handles object answers with conditional fields (e.g. { value: 'yes', conditional: { yes: 'details' } })
	 *
	 * @param {unknown} answer - the raw answer value
	 * @returns {string} the formatted answer for display
	 */
	formatAnswer(answer) {
		if (answer === null || answer === undefined || answer === '') {
			return this.notStartedText;
		}

		// Handle simple string answers
		if (typeof answer !== 'object' || answer.value === undefined) {
			return super.formatAnswer(answer);
		}

		// Handle object answers with conditional fields
		const option = this.options.find((opt) => opt.value === answer.value);
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
