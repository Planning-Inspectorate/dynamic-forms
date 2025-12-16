/**
 * @typedef {import('../../journey/journey-response.js').JourneyResponse} JourneyResponse
 * @typedef {import('../../journey/journey.js').Journey} Journey
 * @typedef {import('../../section.js').Section} Section
 * @typedef {import('../../questions/question.js').QuestionViewModel} QuestionViewModel
 * @typedef {import('appeals-service-api').Api.SubmissionAddress} SubmissionAddress
 */

import { Question } from '../../questions';

export default class AddressQuestion extends Question {
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
	 * @param {import('../../section.js').Section} section
	 * @param {import('../../journey/journey.js').Journey} journey
	 * @param {Record<string, unknown>} customViewData
	 * @returns {import('../../questions/question.js').QuestionViewModel}
	 */
	prepQuestionForRendering(section, journey, customViewData);
	/**
	 * @param {Object<string, any>} answer
	 * @returns The formatted address to be presented in the UI
	 */
	format(answer);
	formatLabelFromRequiredFields(fieldName);
}
