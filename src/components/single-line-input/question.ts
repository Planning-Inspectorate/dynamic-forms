import { Question } from '#question';
import type { Affix, SingleLineInputQuestionParams } from '#typedefs/question-props.ts';
import type { QuestionViewModel } from '#typedefs/question-types.ts';

export class SingleLineInputQuestion extends Question {
	inputAttributes: Record<string, string>;
	label?: string;
	classes: string;
	prefix: Affix | undefined;
	suffix: Affix | undefined;

	constructor(params: SingleLineInputQuestionParams) {
		super({
			...params,
			viewFolder: 'single-line-input'
		});

		this.label = params.label;
		this.inputAttributes = params.inputAttributes || {};
		this.classes = params.classes || '';
		this.prefix = params.prefix;
		this.suffix = params.suffix;
	}

	addCustomDataToViewModel(viewModel: QuestionViewModel) {
		viewModel.question.label = this.label;
		// Extract type from attributes to pass separately to avoid duplication
		const { type, ...otherAttributes } = this.inputAttributes;
		viewModel.question.attributes = otherAttributes;
		viewModel.question.type = type;

		viewModel.question.classes = this.classes;
		viewModel.question.prefix = this.prefix;
		viewModel.question.suffix = this.suffix;
	}
}

export default SingleLineInputQuestion;
