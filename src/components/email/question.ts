import SingleLineInputQuestion from '../single-line-input/question.ts';
import type { EmailQuestionParams } from '../../types/question-props.ts';

/**
 * Email input question that extends SingleLineInputQuestion
 * Automatically sets the input type to "email" and adds appropriate attributes
 */
export class EmailQuestion extends SingleLineInputQuestion {
	constructor(params: EmailQuestionParams) {
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
			inputAttributes: emailInputAttributes,
			autocomplete: autocomplete
		});
	}
}

export default EmailQuestion;
