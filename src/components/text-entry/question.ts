import { Question } from '../../questions/question.ts';
import type { TextEntryQuestionParams } from '../../types/question-props.ts';
import type { QuestionViewModel } from '../../types/question-types.ts';

export class TextEntryQuestion extends Question {
	textEntryCheckbox?: TextEntryQuestionParams['textEntryCheckbox'];
	label?: string;

	constructor({ textEntryCheckbox, label, ...parentParams }: TextEntryQuestionParams) {
		super({
			...parentParams,
			viewFolder: 'text-entry'
		});

		this.textEntryCheckbox = textEntryCheckbox;
		this.label = label;
	}

	addCustomDataToViewModel(viewModel: QuestionViewModel) {
		viewModel.question.label = this.label;
		viewModel.question.textEntryCheckbox = this.textEntryCheckbox;
	}
}

export default TextEntryQuestion;
