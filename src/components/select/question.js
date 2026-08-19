import OptionsQuestion from '../../questions/options-question.js';

export class SelectQuestion extends OptionsQuestion {
	#disableAccessibleAutocomplete;
	/**
	 * @param {import('#typedefs/question-props.d.ts').SelectQuestionParams} params
	 */
	constructor({ label, html, legend, disableAccessibleAutocomplete, viewFolder, ...parentParams }) {
		super({
			...parentParams,
			viewFolder: viewFolder || 'select'
		});

		this.html = html;
		this.label = label;
		this.legend = legend;
		this.#disableAccessibleAutocomplete = disableAccessibleAutocomplete;
	}

	/**
	 * @param {import('#typedefs/question-types.d.ts').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel) {
		viewModel.question.label = this.label;
		viewModel.question.legend = this.legend;
		viewModel.question.disableAccessibleAutocomplete = this.#disableAccessibleAutocomplete;
	}
}

export default SelectQuestion;
