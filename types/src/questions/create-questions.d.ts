/** @typedef {import('./question-props').QuestionProps} QuestionProps */
/**
 * @param {{[questionName: string]: QuestionProps}} questionPropsRecord
 * @param {Record<string, typeof import('./question').Question>} questionClasses
 * @param {{[questionType: string]: Record<string, Function>}} questionMethodOverrides
 * @param {{notStartedText?: string, continueButtonText?: string, changeActionText?: string, answerActionText?: string}} [textOverrides] - customise question text
 */
export function createQuestions(
	questionPropsRecord: {
		[questionName: string]: QuestionProps;
	},
	questionClasses: Record<string, typeof import('./question').Question>,
	questionMethodOverrides: {
		[questionType: string]: Record<string, Function>;
	},
	textOverrides?: {
		notStartedText?: string;
		continueButtonText?: string;
		changeActionText?: string;
		answerActionText?: string;
	}
): {
	[k: string]: any;
};
export type QuestionProps = any;
