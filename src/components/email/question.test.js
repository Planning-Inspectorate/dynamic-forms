import { describe, it } from 'node:test';
import assert from 'node:assert';
import EmailQuestion from './question.js';

describe('src/dynamic-forms/components/email/question.js', () => {
	it('should create an email question with default attributes', () => {
		const emailQuestion = new EmailQuestion({
			title: 'Email Address',
			question: 'What is your email address?',
			fieldName: 'email'
		});

		assert.strictEqual(emailQuestion.viewFolder, 'single-line-input');
		assert.strictEqual(emailQuestion.inputAttributes.type, 'email');
		assert.strictEqual(emailQuestion.inputAttributes.spellcheck, 'false');
		assert.strictEqual(emailQuestion.autocomplete, 'email');
	});

	it('should allow custom input attributes while preserving email defaults', () => {
		const customAttributes = {
			placeholder: 'Enter your email',
			'data-testid': 'email-input'
		};

		const emailQuestion = new EmailQuestion({
			title: 'Email Address',
			question: 'What is your email address?',
			fieldName: 'email',
			inputAttributes: customAttributes
		});

		// Should preserve email-specific attributes
		assert.strictEqual(emailQuestion.inputAttributes.type, 'email');
		assert.strictEqual(emailQuestion.inputAttributes.spellcheck, 'false');

		// Should include custom attributes
		assert.strictEqual(emailQuestion.inputAttributes.placeholder, 'Enter your email');
		assert.strictEqual(emailQuestion.inputAttributes['data-testid'], 'email-input');
	});

	it('should allow overriding default attributes', () => {
		const overrideAttributes = {
			type: 'text', // Override the default email type
			spellcheck: 'true' // Override the default spellcheck
		};

		const emailQuestion = new EmailQuestion({
			title: 'Email Address',
			question: 'What is your email address?',
			fieldName: 'email',
			inputAttributes: overrideAttributes
		});

		// Should use overridden values
		assert.strictEqual(emailQuestion.inputAttributes.type, 'text');
		assert.strictEqual(emailQuestion.inputAttributes.spellcheck, 'true');
	});

	it('should set custom autocomplete attribute', () => {
		const emailQuestion = new EmailQuestion({
			title: 'Work Email',
			question: 'What is your work email address?',
			fieldName: 'workEmail',
			autocomplete: 'work email'
		});

		assert.strictEqual(emailQuestion.autocomplete, 'work email');
	});

	it('should include label when provided', () => {
		const emailQuestion = new EmailQuestion({
			title: 'Contact Email',
			question: 'Provide your contact information',
			fieldName: 'contactEmail',
			label: 'Email Address'
		});

		assert.strictEqual(emailQuestion.label, 'Email Address');
	});

	it('should include custom classes when provided', () => {
		const emailQuestion = new EmailQuestion({
			title: 'Email Address',
			question: 'What is your email address?',
			fieldName: 'email',
			classes: 'govuk-input--width-20'
		});

		assert.strictEqual(emailQuestion.classes, 'govuk-input--width-20');
	});

	it('should prepare question for rendering correctly', () => {
		const emailQuestion = new EmailQuestion({
			title: 'Email Address',
			question: 'What is your email address?',
			fieldName: 'email',
			label: 'Your Email',
			hint: 'We will use this to contact you'
		});

		// Mock section and journey objects with proper structure
		const mockSection = {
			name: 'contact',
			segment: 'contact-section'
		};
		const mockJourney = {
			response: {
				answers: {
					email: 'existing@example.com'
				}
			},
			getBackLink: () => '/back'
		};
		const mockCustomViewData = {};
		const mockPayload = { email: 'test@example.com' };

		const viewModel = emailQuestion.prepQuestionForRendering(mockSection, mockJourney, mockCustomViewData, mockPayload);

		assert.strictEqual(viewModel.question.fieldName, 'email');
		assert.strictEqual(viewModel.question.label, 'Your Email');
		assert.strictEqual(viewModel.question.value, 'test@example.com');
		assert.strictEqual(viewModel.question.type, 'email');
		assert.strictEqual(viewModel.question.attributes.spellcheck, 'false');
	});

	it('should not capitalize email addresses in summary', () => {
		const emailQuestion = new EmailQuestion({
			title: 'Email Address',
			question: 'What is your email address?',
			fieldName: 'email'
		});

		const mockSection = { segment: 'contact' };
		const mockJourney = {
			getCurrentQuestionUrl: () => '/questions/email'
		};
		const emailAddress = 'test@example.com';

		const summary = emailQuestion.formatAnswerForSummary(mockSection.segment, mockJourney, emailAddress);

		// Should preserve the original case of the email address
		assert.strictEqual(summary.length, 1);
		assert.match(summary[0].value, /test@example\.com/);
		assert.doesNotMatch(summary[0].value, /Test@example\.com/);
	});
});
