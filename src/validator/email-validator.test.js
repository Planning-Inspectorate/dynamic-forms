import { describe, it } from 'node:test';
import assert from 'node:assert';
import EmailValidator from './email-validator.js';

describe('src/dynamic-forms/validator/email-validator.js', () => {
	// Helper function to create validation test
	const createValidationTest = async (email, fieldName = 'email') => {
		const req = {
			body: {
				[fieldName]: email
			}
		};
		const question = {
			fieldName
		};
		return await new EmailValidator().validate(question).run(req);
	};

	// Test cases for valid email addresses
	const validEmailTests = [
		'test@example.com',
		'test+tag@example.com',
		'first.last@example.com',
		'user@mail.example.com',
		'test@example.org',
		'verylongusernamethatisusuallynotrecommended@verylongdomainnamethatisalsounusual.com'
	];

	// Test cases for invalid email addresses
	const invalidEmailTests = ['invalid-email', 'test@', 'testexample.com', '', 'test @example.com'];

	// Run tests for valid emails
	validEmailTests.forEach((email) => {
		it(`should validate "${email}" as a correct email address`, async () => {
			const validationResult = await createValidationTest(email);
			assert.strictEqual(validationResult.errors.length, 0);
		});
	});

	// Run tests for invalid emails
	invalidEmailTests.forEach((email) => {
		it(`should invalidate "${email}" as an incorrect email format`, async () => {
			const validationResult = await createValidationTest(email);
			assert.strictEqual(validationResult.errors.length, 1);
			assert.strictEqual(
				validationResult.errors[0].msg,
				'Enter an email address in the correct format, like name@example.com'
			);
		});
	});

	it('should handle undefined email field as invalid', async () => {
		const req = {
			body: {}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator().validate(question).run(req);
		assert.strictEqual(validationResult.errors.length, 1);
	});

	it('should use custom error message when provided', async () => {
		const req = {
			body: {
				email: 'invalid-email'
			}
		};
		const question = {
			fieldName: 'email'
		};
		const customMessage = 'Please provide a valid email address';
		const validationResult = await new EmailValidator({ errorMessage: customMessage }).validate(question).run(req);
		assert.strictEqual(validationResult.errors.length, 1);
		assert.strictEqual(validationResult.errors[0].msg, customMessage);
	});

	it('should handle display names when option is enabled', async () => {
		const req = {
			body: {
				email: 'John Doe <john@example.com>'
			}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator({
			options: { allowDisplayName: true }
		})
			.validate(question)
			.run(req);
		assert.strictEqual(validationResult.errors.length, 0);
	});

	it('should reject display names when option is disabled', async () => {
		const req = {
			body: {
				email: 'John Doe <john@example.com>'
			}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator({
			options: { allowDisplayName: false }
		})
			.validate(question)
			.run(req);
		assert.strictEqual(validationResult.errors.length, 1);
	});

	it('should validate email with custom fieldName', async () => {
		const req = {
			body: {
				contactEmail: 'test@example.com'
			}
		};
		const question = {
			fieldName: 'someOtherField'
		};
		const validationResult = await new EmailValidator({
			fieldName: 'contactEmail'
		})
			.validate(question)
			.run(req);
		assert.strictEqual(validationResult.errors.length, 0);
	});
});
