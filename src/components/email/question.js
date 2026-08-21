import SingleLineInputQuestion from '../single-line-input/question.js';

/**
 * Email input question that extends SingleLineInputQuestion
 * Automatically sets the input type to "email" and adds appropriate attributes
 * @class
 */
export class EmailQuestion extends SingleLineInputQuestion {
	/**
	 * @param {import('#typedefs/question-props.d.ts').EmailQuestionParams} params
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
			// Prevent capitalisation of email answers by default, but allow override
			capitaliseAnswer: false,
			...params,
			viewFolder: 'single-line-input', // Reuse single-line-input template
			inputAttributes: emailInputAttributes,
			autocomplete: autocomplete
		});
	}
}

export default EmailQuestion;
