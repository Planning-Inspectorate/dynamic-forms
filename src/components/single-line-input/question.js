import { Question } from '#question';

/**
 * @class
 * @template {object} [Answers=import('#typedefs/journey-types.d.ts').JourneyAnswers]
 * @extends {Question<Answers>}
 */
export class SingleLineInputQuestion extends Question {
	/** @type {Record<string, string>} */
	inputAttributes;

	/**
	 * @param {import('#typedefs/question-props.d.ts').SingleLineInputQuestionParams<Answers>} params
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
	 * @param {import('#typedefs/question-types.d.ts').QuestionViewModel} viewModel
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
