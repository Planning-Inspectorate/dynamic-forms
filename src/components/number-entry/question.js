import { Question } from '#question';
import { getPersistedNumberAnswer } from '../utils/persisted-number-answer.js';

/**
 * @template {object} [Answers=import('#typedefs/journey-types.d.ts').JourneyAnswers]
 * @extends {Question<Answers>}
 */
export class NumberEntryQuestion extends Question {
	/**
	 * @param {import('#typedefs/question-props.d.ts').NumberEntryQuestionParams<Answers>} params
	 */
	constructor({ label, suffix, ...parentParams }) {
		super({
			// default but allow overrides
			capitaliseAnswer: false,
			...parentParams,
			viewFolder: 'number-entry'
		});

		this.suffix = suffix;
		this.label = label;
	}

	answerForViewModel(answers) {
		return getPersistedNumberAnswer(answers[this.fieldName] || '');
	}

	/**
	 * @param {import('#typedefs/question-types.d.ts').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel) {
		viewModel.question.label = this.label;
		viewModel.question.suffix = this.suffix;
	}
}

export default NumberEntryQuestion;
