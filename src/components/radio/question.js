import OptionsQuestion from '../../questions/options-question.js';
import { nl2br } from '../../lib/utils.js';

export class RadioQuestion extends OptionsQuestion {
	/**
	 * @param {import('#typedefs/question-props.d.ts').RadioQuestionParams} params
	 */
	constructor({
		title,
		question,
		fieldName,
		viewFolder,
		url,
		hint,
		pageTitle,
		description,
		label,
		html,
		legend,
		options,
		validators,
		actionLink,
		editable,
		viewData,
		formatSummaryValue
	}) {
		super({
			title,
			question,
			viewFolder: !viewFolder ? 'radio' : viewFolder,
			fieldName,
			url,
			hint,
			pageTitle,
			description,
			options,
			validators,
			actionLink,
			editable,
			viewData,
			formatSummaryValue
		});

		this.html = html;
		this.label = label;
		this.legend = legend;
	}

	/**
	 * @param {import('../../questions/question.js').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel) {
		viewModel.question.label = this.label;
		viewModel.question.legend = this.legend;
	}

	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @type {import('#question').Question['formatAnswerForSummary']}
	 */
	formatAnswerForSummary(sectionSegment, journey, answer) {
		let defaultValue;
		let selectedOption;

		if (answer?.conditional) {
			selectedOption = this.options.find((option) => option.value === answer.value);
			const conditionalAnswerText = selectedOption?.conditional?.label
				? `${selectedOption.conditional.label} ${answer.conditional}`
				: answer.conditional;
			defaultValue = nl2br([selectedOption?.text, conditionalAnswerText].filter(Boolean).join('\n'));
		} else if (answer) {
			selectedOption = this.options.find((option) => option.value === answer);
			defaultValue = selectedOption?.text || '';
		} else {
			defaultValue = this.notStartedText;
		}

		const displayValue = this.applyCustomSummaryFormatter({
			answer,
			defaultValue,
			question: this,
			journey,
			sectionSegment,
			selectedOption
		});

		return [
			{
				key: this.title,
				value: displayValue,
				action: this.getAction(sectionSegment, journey, answer)
			}
		];
	}
}

export default RadioQuestion;
