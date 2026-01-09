export default class AddressQuestion {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 */
	constructor(params: any);
	requiredFields: {
		[key: string]: boolean;
	};
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
	 * @param {import('#question').QuestionViewModel} viewModel
	 */
	addCustomDataToViewModel(viewModel: any): void;
	/**
	 * Get the data to save from the request, returns an object of answers
	 * @param {import('express').Request} req
	 * @param {import('#journey-response').JourneyResponse} journeyResponse
	 * @returns {Promise<{answers: Record<string, unknown>}>}
	 */ getDataToSave(
		req: any,
		journeyResponse: any
	): Promise<{
		answers: Record<string, unknown>;
	}>;
	/**
	 * @param {Object<string, any>} answer
	 * @returns The formatted address to be presented in the UI
	 */
	format(answer: { [x: string]: any }): string;
	/**
	 * returns the formatted answers values to be used to build task list elements
	 * @type {Question['formatAnswerForSummary']}
	 */
	formatAnswerForSummary(
		sectionSegment: any,
		journey: any,
		answer: any
	): {
		key: string;
		value: any;
		action: any;
	}[];
	formatLabelFromRequiredFields(fieldName: any): '' | ' (optional)';
}
