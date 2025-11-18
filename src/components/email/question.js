import SingleLineInputQuestion from '../single-line-input/question.js';

/**
 * @typedef {import('../../questions/question.js').QuestionViewModel} QuestionViewModel
 * @typedef {import('../../journey/journey.js').Journey} Journey
 * @typedef {import('../../journey/journey-response.js').JourneyResponse} JourneyResponse
 * @typedef {import('../../section').Section} Section
 * @typedef {import('../../validator/base-validator')} BaseValidator
 */

/**
 * Email input question that extends SingleLineInputQuestion
 * Automatically sets the input type to "email" and adds appropriate attributes
 * @class
 */
export default class EmailQuestion extends SingleLineInputQuestion {
	/**
	 * @param {import('#question-types').QuestionParameters} params
	 * @param {string|undefined} [params.label] if defined this show as a label for the input and the question will just be a standard h1
	 * @param {Record<string, string>} [params.inputAttributes] html attributes to add to the input (will be merged with email defaults)
	 * @param {string} [params.classes] html classes to add to the input
	 * @param {string} [params.autocomplete] autocomplete attribute value (defaults to 'email')
	 */
	constructor(params) {
		// Set default input attributes for email
		const emailInputAttributes = {
			type: 'email',
			spellcheck: 'false',
			...params.inputAttributes
		};

		// Set default autocomplete for email if not provided
		const autocomplete = params.autocomplete || 'email';

		super({
			...params,
			viewFolder: 'single-line-input', // Reuse single-line-input template
			inputAttributes: emailInputAttributes,
			autocomplete: autocomplete
		});
	}

	/**
	 * Override formatAnswerForSummary to prevent capitalization of email addresses
	 * Email addresses should remain in their original case (typically lowercase)
	 * @param {string} sectionSegment
	 * @param {import('../../journey/journey.js').Journey} journey
	 * @param {string} answer
	 * @returns {Array}
	 */
	formatAnswerForSummary(sectionSegment, journey, answer) {
		// Call parent method with capitals=false to prevent email capitalization
		return super.formatAnswerForSummary(sectionSegment, journey, answer, false);
	}
}
