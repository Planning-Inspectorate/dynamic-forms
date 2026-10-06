import type { BaseQuestionProps } from '#typedefs/question-props.ts';
import type { QuestionClass } from '#typedefs/question-types.ts';
import type { Question, QuestionMethodOverrides } from '#src/questions/question.ts';

export interface TextOverrides {
	notStartedText?: string;
	continueButtonText?: string;
	changeActionText?: string;
	answerActionText?: string;
}

type OverrideFields = keyof TextOverrides;

export function createQuestions<K extends string = string, T extends BaseQuestionProps = BaseQuestionProps>(
	questionPropsRecord: Record<K, T>,
	questionClasses: Record<string, QuestionClass>,
	// eslint-lint-disable-next-line @typescript-eslint/no-unsafe-function-type
	questionMethodOverrides: Record<string, QuestionMethodOverrides>,
	textOverrides?: TextOverrides
): { [questionName in K]: Question } {
	return Object.fromEntries(
		Object.entries<T>(questionPropsRecord).map(([questionName, props]) => {
			// @ts-expect-error props here is not compatible with the QuestionClass type, this may be fixable!
			const question = new questionClasses[props.type](props, questionMethodOverrides[props.type]);
			if (textOverrides) {
				// todo: is there a better way? this is used to customise e.g. the notStartedText text
				const options: OverrideFields[] = [
					'notStartedText',
					'continueButtonText',
					'changeActionText',
					'answerActionText'
				];
				for (const option of options) {
					if (option in textOverrides) {
						question[option] = textOverrides[option] as string;
					}
				}
			}
			return [questionName, question];
		})
	) as { [questionName in K]: Question };
}
