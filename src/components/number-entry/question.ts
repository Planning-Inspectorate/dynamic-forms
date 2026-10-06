import { Question } from '#question';
import { getPersistedNumberAnswer } from '../utils/persisted-number-answer.ts';

/**
 * Normalises a suffix param into the govuk-frontend Affix shape.
 * Supports the legacy plain-string format for backwards compatibility,
 * emitting a deprecation warning when used.
 *
 * @param {string | import('#typedefs/question-props.d.ts').Affix | undefined} value
 * @returns {import('#typedefs/question-props.d.ts').Affix | undefined}
 */
function toAffix(value) {
	if (value === undefined) {
		return undefined;
	}
	if (typeof value === 'string') {
		console.warn(
			`NumberEntryQuestion: passing a string to 'suffix' is deprecated, use a govuk affix object ({ text, classes? }) instead`
		);
		return { text: value };
	}
	return value;
}

export class NumberEntryQuestion extends Question {
	/**
	 * @param {import('#typedefs/question-props.d.ts').NumberEntryQuestionParams} params
	 */
	constructor({ label, prefix, suffix, ...parentParams }) {
		super({
			// default but allow overrides
			capitaliseAnswer: false,
			...parentParams,
			viewFolder: 'number-entry'
		});

		this.prefix = prefix;
		this.suffix = toAffix(suffix, 'suffix');
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
		viewModel.question.prefix = this.prefix;
		viewModel.question.suffix = this.suffix;
	}
}

export default NumberEntryQuestion;
