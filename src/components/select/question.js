import OptionsQuestion from '../../questions/options-question.js';

export default class SelectQuestion extends OptionsQuestion {
	#disableAccessibleAutocomplete;
	/**
	 * @param {Object} params
	 * @param {string} params.title
	 * @param {string} params.question
	 * @param {string} params.fieldName
	 * @param {string} [params.viewFolder]
	 * @param {string} [params.url]
	 * @param {string} [params.hint]
	 * @param {string} [params.pageTitle]
	 * @param {string} [params.description]
	 * @param {string} [params.label]
	 * @param {string} [params.html]
	 * @param {string} [params.legend] - optional legend, used instead of h1
	 * @param {string} [params.disableAccessibleAutocomplete]
	 * @param {Array.<import('../../questions/options-question.js').Option>} params.options
	 * @param {Object<string, any>} [params.viewData]
	 * @param {Array.<import('#base-validator').BaseValidator>} [params.validators]
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
	 * @param {Object} answer
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
