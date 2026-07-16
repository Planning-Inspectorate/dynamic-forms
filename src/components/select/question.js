import OptionsQuestion from '../../questions/options-question.js';

export class SelectQuestion extends OptionsQuestion {
	#disableAccessibleAutocomplete;
	/**
	 * @param {import('../../questions/question-props.d.ts').SelectQuestionParams} params
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
		disableAccessibleAutocomplete,
		options,
		validators,
		viewData
	}) {
		super({
			title,
			question,
			viewFolder: !viewFolder ? 'select' : viewFolder,
			fieldName,
			url,
			hint,
			pageTitle,
			description,
			options,
			validators,
			viewData
		});

		this.html = html;
		this.label = label;
		this.legend = legend;
		this.#disableAccessibleAutocomplete = disableAccessibleAutocomplete;
	}

	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel) {
		viewModel.question.label = this.label;
		viewModel.question.legend = this.legend;
		viewModel.question.disableAccessibleAutocomplete = this.#disableAccessibleAutocomplete;
	}

	/**
	 * returns the formatted answers values to be used to build task list elements
	 * note: only supports a single answer
	 *
	 * @param {unknown} answer
	 * @param {Journey} journey
	 * @param {String} sectionSegment
	 * @returns {Array.<Object>}
	 */
	formatAnswerForSummary(sectionSegment, journey, answer) {
		if (answer) {
			const selectedOption = this.options.find((option) => option.value === answer);
			const selectedText = selectedOption?.text || '';
			return super.formatAnswerForSummary(sectionSegment, journey, selectedText, false);
		}
		return super.formatAnswerForSummary(sectionSegment, journey, answer);
	}
}

export default SelectQuestion;
