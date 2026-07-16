import SingleLineInputQuestion from '../single-line-input/question.js';

/**
 * @typedef {import('#question').QuestionViewModel} QuestionViewModel
 * @typedef {import('#journey').Journey} Journey
 * @typedef {import('#journey-response').JourneyResponse} JourneyResponse
 * @typedef {import('../../section').Section} Section
 * @typedef {import('../../validator/base-validator')} BaseValidator
 */

/**
 * Email input question that extends SingleLineInputQuestion
 * Automatically sets the input type to "email" and adds appropriate attributes
 * @class
 */
export class EmailQuestion extends SingleLineInputQuestion {
	/**
	 * @param {import('../../questions/question-props.d.ts').EmailQuestionParams} params
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
	 * @param {import('#journey').Journey} journey
	 * @param {string} answer
	 * @returns {Array}
	 */
	formatAnswerForSummary(sectionSegment, journey, answer) {
		// Call parent method with capitals=false to prevent email capitalization
		return super.formatAnswerForSummary(sectionSegment, journey, answer, false);
	}
}

export default EmailQuestion;
