import { Question } from '#question';
import { getPersistedNumberAnswer } from '../utils/persisted-number-answer.js';

export class NumberEntryQuestion extends Question {
	/**
	 * @param {import('../../questions/question-props.d.ts').NumberEntryQuestionParams} params
	 */
	constructor({ label, suffix, ...parentParams }) {
		super({
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
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel) {
		viewModel.question.label = this.label;
		viewModel.question.suffix = this.suffix;
	}

	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @param {unknown} answer
	 * @param {import('#journey').Journey} journey
	 * @param {String} sectionSegment
	 * @returns {Array<{
	 *   key: string;
	 *   value: string | Object;
	 *   action: {
	 *     href: string;
	 *     text: string;
	 *     visuallyHiddenText: string;
	 *   };
	 * }>}
	 */
	formatAnswerForSummary(sectionSegment, journey, answer) {
		return super.formatAnswerForSummary(sectionSegment, journey, answer, false);
	}
}

export default NumberEntryQuestion;
