import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validationResult } from 'express-validator';

import AddressValidator, {
	addressLine1MaxLength,
	addressLine2MaxLength,
	postcodeMaxLength,
	postcodeMinLength,
	townCityMaxLength,
	validatePostcode
} from './address-validator.ts';

describe('validatePostcode', () => {
	it('should accept standard postcode formats and GIR 0AA', () => {
		for (const postcode of ['SW11 2DR', 'M1 1AA', 'M11AA', 'B33 8TH', 'W1A 1HQ', 'EC1A 1BB', 'GIR 0AA']) {
			assert.strictEqual(validatePostcode(postcode), postcode);
		}
	});

	it('should be case-insensitive and ignore all whitespace', () => {
		assert.strictEqual(validatePostcode('sw11 2dr'), 'sw11 2dr');
		assert.strictEqual(validatePostcode(' S W 1 1 2D R    '), ' S W 1 1 2D R    ');
		assert.strictEqual(validatePostcode('eC1a\t1bB'), 'eC1a\t1bB');
	});

	it('should reject invalid postcodes and partial matches', () => {
		for (const postcode of ['', 'SW11X2DR', 'SW11-2DR', 'Q1 1AA', 'V1 1AA', 'M1 1CA', 'xBS1 6PN', 'BS1 6PNx']) {
			assert.throws(() => validatePostcode(postcode), {
				message: 'Enter a valid postcode'
			});
		}
	});
});

describe('AddressValidator', () => {
	it('should validate a valid address without errors', async () => {
		const question = {
			fieldName: 'testField'
		};

		const req = {
			body: {
				testField_addressLine1: 'A Building',
				testField_addressLine2: 'A Street',
				testField_townCity: 'Test town',
				testField_postcode: 'WC2A2ZA'
			}
		};

		const errors = await _validationMappedErrors(req, question);

		assert.deepStrictEqual(errors, {});
	});

	it('should validate address with empty addressLine2 and county without errors', async () => {
		const question = {
			fieldName: 'testField'
		};

		const req = {
			body: {
				testField_addressLine1: 'A Building',
				testField_addressLine2: '',
				testField_townCity: 'Test city',
				testField_postcode: 'BS1 6PN',
				county: ''
			}
		};

		const errors = await _validationMappedErrors(req, question);

		assert.deepStrictEqual(errors, {});
	});

	it('should validate address with errors when required fields are missing', async () => {
		const question = {
			fieldName: 'testField',
			requiredFields: {
				addressLine1: true,
				addressLine2: true,
				townCity: true,
				county: true,
				postcode: true
			}
		};

		const req = {
			body: {
				testField_addressLine1: '',
				testField_addressLine2: '',
				testField_townCity: '',
				testField_county: '',
				testField_postcode: ''
			}
		};

		const errors = await _validationMappedErrors(req, question);

		assert.strictEqual(Object.keys(errors).length, 5);
		assert.strictEqual(errors.testField_addressLine1.msg, 'Enter address line 1, typically the building and street');
		assert.strictEqual(errors.testField_addressLine2.msg, 'Enter an address line 2');
		assert.strictEqual(errors.testField_townCity.msg, 'Enter a town or city');
		assert.strictEqual(errors.testField_county.msg, 'Enter a county');
		assert.strictEqual(errors.testField_postcode.msg, 'Enter a postcode');
	});

	it('should reject invalid address with too long fields with errors', async () => {
		const question = {
			fieldName: 'testField'
		};

		const req = {
			body: {
				testField_addressLine1: '*'.repeat(addressLine1MaxLength + 1),
				testField_addressLine2: '*'.repeat(addressLine2MaxLength + 1),
				testField_townCity: '*'.repeat(townCityMaxLength + 1),
				testField_postcode: '*'.repeat(postcodeMaxLength + 1)
			}
		};

		const errors = await _validationMappedErrors(req, question);

		assert.strictEqual(Object.keys(errors).length, 4);
		assert.strictEqual(
			errors.testField_addressLine1.msg,
			`Address line 1 must be ${addressLine1MaxLength} characters or less`
		);
		assert.strictEqual(
			errors.testField_addressLine2.msg,
			`Address line 2 must be ${addressLine2MaxLength} characters or less`
		);
		assert.strictEqual(errors.testField_townCity.msg, `Town or city must be ${townCityMaxLength} characters or less`);
		assert.strictEqual(
			errors.testField_postcode.msg,
			`Postcode must be between ${postcodeMinLength} and ${postcodeMaxLength} characters`
		);
	});
	it('should validate a valid 8-character postcode without errors', async () => {
		const question = {
			fieldName: 'testField'
		};

		const req = {
			body: {
				testField_addressLine1: 'A Building',
				testField_addressLine2: 'A Street',
				testField_townCity: 'Test town',
				testField_postcode: 'DN55 1PT'
			}
		};

		const errors = await _validationMappedErrors(req, question);

		assert.deepStrictEqual(errors, {});
	});
	// New postcode tests
	it('should validate a valid 5-character postcode without a space', async () => {
		const question = { fieldName: 'testField' };
		const req = {
			body: {
				testField_addressLine1: 'A Building',
				testField_addressLine2: 'A Street',
				testField_townCity: 'Test town',
				testField_postcode: 'M11AA'
			}
		};
		const errors = await _validationMappedErrors(req, question);
		assert.deepStrictEqual(errors, {});
	});

	it('should reject a postcode with multiple spaces', async () => {
		const question = { fieldName: 'testField' };
		const req = {
			body: {
				testField_addressLine1: 'A Building',
				testField_addressLine2: 'A Street',
				testField_townCity: 'Test town',
				testField_postcode: 'AB1  2CD'
			}
		};
		const errors = await _validationMappedErrors(req, question);
		assert.strictEqual(errors.testField_postcode.msg, 'Enter a valid postcode');
	});

	it('should reject a postcode shorter than 5 characters', async () => {
		const question = { fieldName: 'testField' };
		const req = {
			body: {
				testField_addressLine1: 'A Building',
				testField_addressLine2: 'A Street',
				testField_townCity: 'Test town',
				testField_postcode: 'A1 1'
			}
		};
		const errors = await _validationMappedErrors(req, question);
		assert.strictEqual(
			errors.testField_postcode.msg,
			`Postcode must be between ${postcodeMinLength} and ${postcodeMaxLength} characters`
		);
	});

	it('should reject a postcode longer than 8 characters', async () => {
		const question = { fieldName: 'testField' };
		const req = {
			body: {
				testField_addressLine1: 'A Building',
				testField_addressLine2: 'A Street',
				testField_townCity: 'Test town',
				testField_postcode: 'DN55 1PTA'
			}
		};
		const errors = await _validationMappedErrors(req, question);
		assert.strictEqual(
			errors.testField_postcode.msg,
			`Postcode must be between ${postcodeMinLength} and ${postcodeMaxLength} characters`
		);
	});
});

const _validationMappedErrors = async (req, question) => {
	const addressValidator = new AddressValidator({ requiredFields: question.requiredFields });

	const validationRules = addressValidator.validate(question);

	await Promise.all(validationRules.map((validator) => validator.run(req)));

	const errors = validationResult(req);

	return errors.mapped();
};
