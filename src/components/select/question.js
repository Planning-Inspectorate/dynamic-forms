import OptionsQuestion from '../../questions/options-question.js';

/**
 * @template {object} [Answers=import('#typedefs/journey-types.d.ts').JourneyAnswers]
 * @extends {OptionsQuestion<Answers>}
 */
export class SelectQuestion extends OptionsQuestion {
	#disableAccessibleAutocomplete;
	/**
	 * @param {import('#typedefs/question-props.d.ts').SelectQuestionParams<Answers>} params
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
