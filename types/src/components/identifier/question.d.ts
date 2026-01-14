export default class IdentifierQuestion extends Question {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {string} [params.inputClasses] css class string to be added to the input
	 * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
	 */
	constructor({ inputClasses, label, ...params }: import('#question-types').QuestionParameters);
	/** @type {string|undefined} page h1, optional, will default to use question's label */
	pageHeading: string | undefined;
	/** @type {string} css classes to apply to input element */
	inputClasses: string;
	label: any;
}
import { Question } from '#question';
//# sourceMappingURL=question.d.ts.map
