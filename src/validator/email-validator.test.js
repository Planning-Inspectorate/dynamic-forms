import { describe, it } from 'node:test';
import assert from 'node:assert';
import EmailValidator from './email-validator.js';

describe('src/dynamic-forms/validator/email-validator.js', () => {
	it('should validate a correct email address', async () => {
		const req = {
			body: {
				email: 'test@example.com'
			}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator().validate(question).run(req);
		assert.strictEqual(validationResult.errors.length, 0);
	});

	it('should invalidate an incorrect email format', async () => {
		const req = {
			body: {
				email: 'invalid-email'
			}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator().validate(question).run(req);
		assert.strictEqual(validationResult.errors.length, 1);
		assert.strictEqual(
			validationResult.errors[0].msg,
			'Enter an email address in the correct format, like name@example.com'
		);
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

	it('should validate email with plus sign in local part', async () => {
		const req = {
			body: {
				email: 'test+tag@example.com'
			}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator().validate(question).run(req);
		assert.strictEqual(validationResult.errors.length, 0);
	});

	it('should validate email with dots in local part', async () => {
		const req = {
			body: {
				email: 'first.last@example.com'
			}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator().validate(question).run(req);
		assert.strictEqual(validationResult.errors.length, 0);
	});

	it('should invalidate email without domain', async () => {
		const req = {
			body: {
				email: 'test@'
			}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator().validate(question).run(req);
		assert.strictEqual(validationResult.errors.length, 1);
	});

	it('should invalidate email without @ symbol', async () => {
		const req = {
			body: {
				email: 'testexample.com'
			}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator().validate(question).run(req);
		assert.strictEqual(validationResult.errors.length, 1);
	});

	it('should validate email with subdomain', async () => {
		const req = {
			body: {
				email: 'user@mail.example.com'
			}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator().validate(question).run(req);
		assert.strictEqual(validationResult.errors.length, 0);
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

	it('should handle empty string as invalid email', async () => {
		const req = {
			body: {
				email: ''
			}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator().validate(question).run(req);
		assert.strictEqual(validationResult.errors.length, 1);
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

	it('should validate international domain names', async () => {
		const req = {
			body: {
				email: 'test@example.org'
			}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator().validate(question).run(req);
		assert.strictEqual(validationResult.errors.length, 0);
	});

	it('should validate long email addresses', async () => {
		const req = {
			body: {
				email: 'verylongusernamethatisusuallynotrecommended@verylongdomainnamethatisalsounusual.com'
			}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator().validate(question).run(req);
		assert.strictEqual(validationResult.errors.length, 0);
	});

	it('should invalidate emails with spaces', async () => {
		const req = {
			body: {
				email: 'test @example.com'
			}
		};
		const question = {
			fieldName: 'email'
		};
		const validationResult = await new EmailValidator().validate(question).run(req);
		assert.strictEqual(validationResult.errors.length, 1);
	});
});
