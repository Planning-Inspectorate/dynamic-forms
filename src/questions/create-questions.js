/**
 * @template {string} K Question keys in questionPropsRecord
 * @template {import('#typedefs/question-props.d.ts').BaseQuestionProps} T
 * @param {{[questionName in K]: T}} questionPropsRecord
 * @param {Record<string, import('#typedefs/question-types.d.ts').QuestionClass>} questionClasses
 * @param {{[questionType: string]: Record<string, Function>}} questionMethodOverrides
 * @param {{notStartedText?: string, continueButtonText?: string, changeActionText?: string, answerActionText?: string}} [textOverrides] - customise question text
 * @returns {{[questionName in K]: InstanceType<import('#typedefs/question-types.d.ts').QuestionClass>}} Returns the same question keys that were passed in with each value being an instantiated question
 */
export function createQuestions(questionPropsRecord, questionClasses, questionMethodOverrides, textOverrides) {
	return Object.fromEntries(
		Object.entries(questionPropsRecord).map(([questionName, props]) => {
			// This error happens because many of the
			// question extensions hardcode their viewFolder
			// in their super call. We want view folder to be
			// optional in question params but it's necessary
			// to super Question.
			// @ts-ignore
			const question = new questionClasses[props.type](props, questionMethodOverrides[props.type]);
			if (textOverrides) {
				// todo: is there a better way? this is used to customise e.g. the notStartedText text
				const options = ['notStartedText', 'continueButtonText', 'changeActionText', 'answerActionText'];
				for (const option of options) {
					if (option in textOverrides) {
						question[option] = textOverrides[option];
					}
				}
			}
			return [questionName, question];
		})
	);
}
