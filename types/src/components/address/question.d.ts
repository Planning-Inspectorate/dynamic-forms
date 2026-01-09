export default class AddressQuestion extends Question {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 */
	constructor(params: import('#question-types').QuestionParameters);
	requiredFields:
		| {
				[key: string]: boolean;
		  }
		| undefined;
	addressLabels: {
		addressLine1: string;
		addressLine2: string;
		townCity: string;
		county: string;
		postcode: string;
	};
	/**
	 * @param {Record<string, any>} answers
	 * @returns {*|string}
	 */
	answerForViewModel(answers: Record<string, any>): any | string;
	/**
	 * @param {Object<string, any>} answer
	 * @returns The formatted address to be presented in the UI
	 */
	format(answer: { [x: string]: any }): string;
	formatLabelFromRequiredFields(fieldName: any): '' | ' (optional)';
}
import { Question } from '#question';
