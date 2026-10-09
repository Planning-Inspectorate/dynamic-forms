import { Question } from '../../questions/question.ts';
import { getPersistedNumberAnswer } from '../utils/persisted-number-answer.ts';
import type { Affix, NumberEntryQuestionParams } from '../../types/question-props.ts';
import type { QuestionViewModel } from '../../types/question-types.ts';

/**
 * Normalises a suffix param into the govuk-frontend Affix shape.
 * Supports the legacy plain-string format for backwards compatibility,
 * emitting a deprecation warning when used.
 */
function toAffix(value: string | Affix | undefined): Affix | undefined {
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
	prefix?: Affix;
	suffix?: Affix;
	label?: string;

	constructor({ label, prefix, suffix, ...parentParams }: NumberEntryQuestionParams) {
		super({
			// default but allow overrides
			capitaliseAnswer: false,
			...parentParams,
			viewFolder: 'number-entry'
		});

		this.prefix = prefix;
		this.suffix = toAffix(suffix);
		this.label = label;
	}

	answerForViewModel(answers: Record<string, unknown>) {
		return getPersistedNumberAnswer((answers[this.fieldName] as number) || '');
	}

	addCustomDataToViewModel(viewModel: QuestionViewModel) {
		viewModel.question.label = this.label;
		viewModel.question.prefix = this.prefix;
		viewModel.question.suffix = this.suffix;
	}
}

export default NumberEntryQuestion;
