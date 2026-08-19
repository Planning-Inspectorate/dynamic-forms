import escape from 'escape-html';
import OptionsQuestion from '../../questions/options-question.js';

const defaultOptionJoinString = ',';

export class CheckboxQuestion extends OptionsQuestion {
	/**
	 * @param {import('#typedefs/question-props.d.ts').CheckboxQuestionParams} params
	 */
	constructor({ ...parentParams }) {
		super({
			...parentParams,
			viewFolder: 'checkbox',
			capitaliseAnswer: false
		});

		this.optionJoinString = defaultOptionJoinString;
	}

	/**
	 * Formats an answer value for display in the summary.
	 * Handles object answers with conditional fields.
	 * - Single value with conditional: { value: 'yes', conditional: { yes: 'details' } }
	 * - Multiple values with conditionals: { value: 'yes,no', conditional: { yes: 'details1', no: 'details2' } }
	 *
	 * @param {unknown} answer - the raw answer value
	 * @returns {string} the formatted answer for display
	 */
	formatAnswer(answer) {
		if (answer === null || answer === undefined || answer === '') {
			return this.notStartedText;
		}

		// Handle simple string answers (e.g. '1,2')
		if (typeof answer !== 'object' || answer.value === undefined) {
			return super.formatAnswer(answer);
		}

		// Handle object answers with conditional fields
		// TODO DF-51 treat as an array
		const answerValues = String(answer.value)
			.split(this.optionJoinString)
			.map((v) => v.trim());
		const conditionals = answer.conditional || {};

		const formattedParts = answerValues.map((value) => {
			const option = this.options.find((opt) => opt.value === value);
			const optionText = escape(option ? option.text : value);

			// Check if this option has a conditional answer
			const conditionalValue = conditionals[value];
			if (conditionalValue) {
				const label = option?.conditional?.label ? `${escape(option.conditional.label)} ` : '';
				return `${optionText}<br>${label}${escape(conditionalValue)}`;
			}

			return optionText;
		});

		return formattedParts.join('<br>');
	}
}

export default CheckboxQuestion;
