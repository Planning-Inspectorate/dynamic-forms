import type OptionsQuestion from '../../questions/options-question.ts';
import type { Question } from '../../questions/question.ts';
import type UnitOptionEntryQuestion from '../unit-option-entry/question.ts';

export function getConditionalFieldName(parentField: string, conditionalField: string) {
	return `${parentField}_${conditionalField}`;
}

/**
 * Get conditional answer(s) for a question.
 * Returns an object keyed by option value with conditional answers, or null if no conditionals exist.
 */
export function getConditionalAnswer(
	answers: Record<string, unknown>,
	question: Question | OptionsQuestion | UnitOptionEntryQuestion,
	answer: unknown
): Record<string, string> | null {
	if (!answer || !questionHasOptions(question)) {
		return null;
	}

	const optionByValue = (value: string) => {
		if ('optionByValue' in question) {
			return question.optionByValue(value);
		}
		return question.options.find((opt) => opt.value === value);
	};

	// TODO DF-51 treat as an array
	const joinString = question.optionJoinString || ',';
	const answerValues = String(answer)
		.split(joinString)
		.map((v) => v.trim());

	const conditionals: Record<string, string> = {};
	for (const value of answerValues) {
		const option = optionByValue(value);
		if (!option?.conditional?.fieldName) {
			continue;
		}
		const conditionalValue = answers[getConditionalFieldName(question.fieldName, option.conditional.fieldName)];
		if (conditionalValue) {
			conditionals[value] = conditionalValue as string;
		}
	}
	return Object.keys(conditionals).length > 0 ? conditionals : null;
}

function questionHasOptions(
	question: Question | OptionsQuestion
): question is OptionsQuestion | UnitOptionEntryQuestion {
	return 'options' in question;
}

export function conditionalIsJustHTML(conditional: unknown): conditional is { html: string } {
	return !!conditional && Object.hasOwn(conditional, 'html') && Object.keys(conditional).length === 1;
}

export default {
	getConditionalAnswer,
	getConditionalFieldName
};
