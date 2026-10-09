import OptionsQuestion from '../../questions/options-question.ts';
import type { SelectQuestionParams } from '../../types/question-props.ts';
import type { QuestionViewModel } from '../../types/question-types.ts';

export class SelectQuestion extends OptionsQuestion {
	#disableAccessibleAutocomplete;
	label?: string;
	legend?: string;

	constructor({
		label,
		html,
		legend,
		disableAccessibleAutocomplete,
		viewFolder,
		...parentParams
	}: SelectQuestionParams) {
		super({
			...parentParams,
			viewFolder: viewFolder || 'select'
		});

		this.html = html;
		this.label = label;
		this.legend = legend;
		this.#disableAccessibleAutocomplete = disableAccessibleAutocomplete;
	}

	addCustomDataToViewModel(viewModel: QuestionViewModel) {
		viewModel.question.label = this.label;
		viewModel.question.legend = this.legend;
		viewModel.question.disableAccessibleAutocomplete = this.#disableAccessibleAutocomplete;
	}
}

export default SelectQuestion;
