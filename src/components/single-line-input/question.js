import { Question } from '#question';

/**
 * @class
 */
export class SingleLineInputQuestion extends Question {
	/** @type {Record<string, string>} */
	inputAttributes;

	/**
	 * @param {import('../../questions/question-props.d.ts').SingleLineInputQuestionParams} params
	 */
	constructor(params) {
		super({
			...params,
			viewFolder: 'single-line-input'
		});

		this.label = params.label;
		this.inputAttributes = params.inputAttributes || {};
		this.classes = params.classes || '';
	}

	/**
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel) {
		viewModel.question.label = this.label;
		// Extract type from attributes to pass separately to avoid duplication
		const { type, ...otherAttributes } = this.inputAttributes;
		viewModel.question.attributes = otherAttributes;
		viewModel.question.type = type;

		viewModel.question.classes = this.classes;
	}
}

export default SingleLineInputQuestion;
