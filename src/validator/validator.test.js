import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert';
import validate from './validator.js';
import RequiredValidator from './required-validator.js';
import ValidOptionValidator from './valid-option-validator.js';
import AddressValidator from './address-validator.js';
import DateValidator from '#src/validator/date-validator.js';

describe('./src/dynamic-forms/validator/validator.js', () => {
	let mockRes;
	beforeEach(() => {
		mockRes = {
			locals: {
				journeyResponse: {},
				journey: {
					getQuestionByParams: function () {
						return null;
					}
				}
			}
		};
	});

	it('should error with invalid question', async () => {
		const req = {
			params: {},
			body: {}
		};

		const next = mock.fn();
		let error = null;
		try {
			await validate(req, mockRes, next);
		} catch (e) {
			error = e;
		}

		assert.strictEqual(error.message, 'unknown question type');
	});

	it('should validate a single validator', async () => {
		const req = {
			params: {
				section: 1,
				question: 1,
				referenceId: 'abc'
			},
			body: {
				field1: 'bananas'
			}
		};

		mockRes.locals.journey = {
			getQuestionByParams: function () {
				return {
					validators: [new RequiredValidator()],
					fieldName: 'field1'
				};
			}
		};

		const next = mock.fn();
		await validate(req, mockRes, next);

		assert.strictEqual(req['express-validator#contexts'][0]._errors.length, 0);
		assert.strictEqual(next.mock.callCount(), 1);
	});

	it('should trim leading and trailing whitespaces', async () => {
		const req = {
			params: {
				section: 1,
				question: 1,
				referenceId: 'abc'
			},
			body: {
				field1: ' bananas '
			}
		};

		mockRes.locals.journey = {
			getQuestionByParams: function () {
				return {
					validators: [new RequiredValidator()],
					fieldName: 'field1'
				};
			}
		};

		const next = mock.fn();
		await validate(req, mockRes, next);

		assert.strictEqual(req.body.field1, 'bananas');
		assert.strictEqual(next.mock.callCount(), 1);
	});

	it('should invalidate a single validator', async () => {
		const req = {
			params: {
				section: 1,
				question: 1,
				referenceId: 'abc'
			},
			body: {
				field1: ''
			}
		};

		mockRes.locals.journey = {
			getQuestionByParams: function () {
				return {
					validators: [new RequiredValidator()],
					fieldName: 'field1'
				};
			}
		};

		const next = mock.fn();
		await validate(req, mockRes, next);

		assert.strictEqual(req['express-validator#contexts'][0]._errors.length, 1);
		assert.strictEqual(next.mock.callCount(), 1);
	});

	it('should validate multiple validators', async () => {
		const req = {
			params: {
				section: 1,
				question: 1
			},
			body: {
				field1: 'bananas'
			}
		};

		mockRes.locals.journey = {
			getQuestionByParams: function () {
				return {
					validators: [new RequiredValidator(), new ValidOptionValidator()],
					fieldName: 'field1',
					options: [
						{
							text: 'Apples',
							value: 'apples'
						},
						{
							text: 'Pears',
							value: 'pears'
						},
						{
							text: 'Bananas',
							value: 'bananas'
						}
					]
				};
			}
		};

		const next = mock.fn();
		await validate(req, mockRes, next);

		assert.strictEqual(req['express-validator#contexts'][0]._errors.length, 0);
		assert.strictEqual(next.mock.callCount(), 1);
	});

	it('should invalidate some validators', async () => {
		const req = {
			params: {
				section: 1,
				question: 1
			},
			body: {
				field1: 'kumquat'
			}
		};

		mockRes.locals.journey = {
			getQuestionByParams: function () {
				return {
					validators: [new RequiredValidator(), new ValidOptionValidator()],
					fieldName: 'field1',
					options: [
						{
							text: 'Apples',
							value: 'apples'
						},
						{
							text: 'Pears',
							value: 'pears'
						},
						{
							text: 'Bananas',
							value: 'bananas'
						}
					]
				};
			}
		};

		const next = mock.fn();
		await validate(req, mockRes, next);

		assert.strictEqual(req['express-validator#contexts'][1]._errors.length, 1);
		assert.strictEqual(next.mock.callCount(), 1);
	});

	it('can handle a validator that returns array of validation rules', async () => {
		const req = {
			params: {
				section: 1,
				question: 1,
				referenceId: 'abc'
			},
			body: {
				field1_addressLine1: '',
				field1_townCity: ''
			}
		};

		mockRes.locals.journey = {
			getQuestionByParams: function () {
				return {
					validators: [new AddressValidator()],
					fieldName: 'field1'
				};
			}
		};

		const next = mock.fn();
		await validate(req, mockRes, next);

		const validatorContexts = req['express-validator#contexts'];

		const getContext = (field) => validatorContexts.find((context) => context.fields[0] === field);
		const addressLine1 = getContext('field1_addressLine1');
		const addressLine2 = getContext('field1_addressLine2');
		const townCity = getContext('field1_townCity');
		const postcode = getContext('field1_postcode');

		assert.strictEqual(addressLine1._errors.length, 0);
		assert.strictEqual(addressLine2._errors.length, 0);
		assert.strictEqual(townCity._errors.length, 0);
		assert.strictEqual(postcode._errors.length, 0);
		assert.strictEqual(next.mock.callCount(), 1);
	});

	it('should display errors from a multi-field array validator in correct order (e.g., day, month, year)', async () => {
		const req = {
			params: {
				section: 1,
				question: 1,
				referenceId: 'abc'
			},
			body: {
				field1_day: '32',
				field1_month: '13',
				field1_year: '99'
			}
		};

		mockRes.locals.journey = {
			getQuestionByParams: function () {
				return {
					validators: [new DateValidator('the date')],
					fieldName: 'field1'
				};
			}
		};

		const next = mock.fn();
		await validate(req, mockRes, next);

		const { validationResult } = await import('express-validator');
		const errors = validationResult(req);
		const mappedErrors = errors.mapped();
		const errorKeys = Object.keys(mappedErrors);

		// Verify all three errors exist
		assert.strictEqual(errorKeys.includes('field1_day'), true, 'Missing day error');
		assert.strictEqual(errorKeys.includes('field1_month'), true, 'Missing month error');
		assert.strictEqual(errorKeys.includes('field1_year'), true, 'Missing year error');

		// Verify errors are in the correct order: day, month, year
		const dayIndex = errorKeys.indexOf('field1_day');
		const monthIndex = errorKeys.indexOf('field1_month');
		const yearIndex = errorKeys.indexOf('field1_year');

		assert.strictEqual(dayIndex < monthIndex, true, 'Day error should come before month error');
		assert.strictEqual(monthIndex < yearIndex, true, 'Month error should come before year error');

		assert.strictEqual(next.mock.callCount(), 1);
	});
});
