import { describe, test, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import CrossQuestionValidator from './cross-question-validator.js';

function createMockRequest(answers) {
	return {
		res: {
			locals: {
				journeyResponse: {
					answers: answers || {}
				}
			}
		}
	};
}

/**
 * Creates a mock question object with a simple getDataToSave that returns the body field value.
 * @param {string} fieldName
 * @returns {{fieldName: string, bodyFieldNames: string[], getDataToSave: Function}}
 */
function createMockQuestion(fieldName) {
	return {
		fieldName,
		bodyFieldNames: [fieldName],
		getDataToSave: async (req) => ({
			answers: {
				[fieldName]: req.body[fieldName]
			}
		})
	};
}

/**
 * Creates a mock date question that extracts date from day/month/year fields.
 * @param {string} fieldName
 * @returns {{fieldName: string, bodyFieldNames: string[], getDataToSave: Function}}
 */
function createMockDateQuestion(fieldName) {
	return {
		fieldName,
		bodyFieldNames: [`${fieldName}_day`, `${fieldName}_month`, `${fieldName}_year`],
		getDataToSave: async (req) => {
			const day = req.body[`${fieldName}_day`];
			const month = req.body[`${fieldName}_month`];
			const year = req.body[`${fieldName}_year`];
			if (!day || !month || !year) {
				throw new Error(`Incomplete date fields for ${fieldName}`);
			}
			return {
				answers: {
					[fieldName]: new Date(year, month - 1, day)
				}
			};
		}
	};
}

/**
 * Creates a mock date-period question that extracts start/end dates.
 * @param {string} fieldName
 * @returns {{fieldName: string, bodyFieldNames: string[], getDataToSave: Function}}
 */
function createMockDatePeriodQuestion(fieldName) {
	return {
		fieldName,
		bodyFieldNames: [
			`${fieldName}_start_day`,
			`${fieldName}_start_month`,
			`${fieldName}_start_year`,
			`${fieldName}_end_day`,
			`${fieldName}_end_month`,
			`${fieldName}_end_year`
		],
		getDataToSave: async (req) => {
			const startDay = req.body[`${fieldName}_start_day`];
			const startMonth = req.body[`${fieldName}_start_month`];
			const startYear = req.body[`${fieldName}_start_year`];
			const endDay = req.body[`${fieldName}_end_day`];
			const endMonth = req.body[`${fieldName}_end_month`];
			const endYear = req.body[`${fieldName}_end_year`];
			if (!startDay || !startMonth || !startYear) {
				throw new Error(`Incomplete start date fields for ${fieldName}`);
			}
			if (!endDay || !endMonth || !endYear) {
				throw new Error(`Incomplete end date fields for ${fieldName}`);
			}
			return {
				answers: {
					[fieldName]: {
						start: new Date(startYear, startMonth - 1, startDay),
						end: new Date(endYear, endMonth - 1, endDay)
					}
				}
			};
		}
	};
}

describe('CrossQuestionValidator', () => {
	test('should throw an error if dependencyFieldName is missing', () => {
		assert.throws(() => {
			new CrossQuestionValidator({ validationFunction: () => true });
		}, /requires dependencyFieldName/);
	});

	test('should throw an error if validationFunction is missing', () => {
		assert.throws(() => {
			new CrossQuestionValidator({ dependencyFieldName: 'other' });
		}, /requires a validationFunction/);
	});

	test('should throw an error if validationFunction is not a function', () => {
		assert.throws(() => {
			new CrossQuestionValidator({ dependencyFieldName: 'other', validationFunction: 123 });
		}, /requires a validationFunction/);
	});

	test('should return a validation chain that calls the validation function with correct answers', async () => {
		const validationFn = mock.fn(() => true);
		const validator = new CrossQuestionValidator({
			dependencyFieldName: 'other',
			validationFunction: validationFn
		});
		const questionObj = createMockQuestion('field');
		const req = createMockRequest({ field: 'foo', other: 'bar' });
		const chain = validator.validate(questionObj, req.res.locals.journeyResponse);
		await chain[0].run(req);
		assert.deepEqual(validationFn.mock.calls[0].arguments, ['foo', 'bar']);
	});

	test('should fail validation if validation function returns false', async () => {
		const validator = new CrossQuestionValidator({
			dependencyFieldName: 'other',
			validationFunction: () => false
		});
		const questionObj = createMockQuestion('field');
		const chain = validator.validate(questionObj);
		const req = createMockRequest({ field: 'foo', other: 'bar' });
		req.body = { field: 'foo' };
		const result = await chain[0].run(req);
		assert.strictEqual(result.isEmpty(), false);
		assert.match(result.array()[0].msg, /Cross-question validation failed/);
	});

	test('should call validation function when journeyResponse is missing', async () => {
		const validationFn = mock.fn(() => true);
		const validator = new CrossQuestionValidator({
			dependencyFieldName: 'other',
			validationFunction: validationFn
		});
		const questionObj = createMockQuestion('field');
		const chain = validator.validate(questionObj);
		const req = { res: { locals: {} } };
		await chain[0].run(req);
		assert.deepEqual(validationFn.mock.calls[0].arguments, [undefined, undefined]);
	});

	it('should use JourneyResponse answers instead of request body values when useBodyValues is false', async () => {
		const validationFn = mock.fn(() => true);
		const validator = new CrossQuestionValidator({
			dependencyFieldName: 'other',
			validationFunction: validationFn
		});
		const questionObj = createMockQuestion('field');
		const req = createMockRequest({ field: 'from-journey-response', other: 'from-journey-response-dependency' });
		req.body = { field: 'from-body', other: 'from-body-dependency' };
		const chain = validator.validate(questionObj, req.res.locals.journeyResponse);
		await chain[0].run(req);
		assert.deepEqual(validationFn.mock.calls[0].arguments, [
			'from-journey-response',
			'from-journey-response-dependency'
		]);
	});

	it('should use request body values when useBodyValues is true', async () => {
		const validationFn = mock.fn(() => true);
		const validator = new CrossQuestionValidator({
			dependencyFieldName: 'other',
			useBodyValues: true,
			validationFunction: validationFn
		});
		const questionObj = createMockQuestion('field');
		const chain = validator.validate(questionObj);
		const req = createMockRequest({ field: 'from-journey-response', other: 'from-journey-response-dependency' });
		req.body = { field: 'from-body', other: 'from-body-dependency' };
		await chain[0].run(req);
		assert.deepEqual(validationFn.mock.calls[0].arguments, ['from-body', 'from-body-dependency']);
	});

	it('should fail validation with thrown error message when validation function throws', async () => {
		const validator = new CrossQuestionValidator({
			dependencyFieldName: 'other',
			validationFunction: () => {
				throw new Error('boom');
			}
		});
		const questionObj = createMockQuestion('field');
		const chain = validator.validate(questionObj);
		const req = createMockRequest({ field: 'foo', other: 'bar' });
		const result = await chain[0].run(req);
		assert.strictEqual(result.isEmpty(), false);
		assert.strictEqual(result.array()[0].msg, 'boom');
	});

	it('should call validation function with undefined values when journeyResponse has no answers object', async () => {
		const validationFn = mock.fn(() => true);
		const validator = new CrossQuestionValidator({
			dependencyFieldName: 'other',
			validationFunction: validationFn
		});
		const questionObj = createMockQuestion('field');
		const chain = validator.validate(questionObj);
		const req = { res: { locals: { journeyResponse: {} } } };
		await chain[0].run(req);
		assert.deepEqual(validationFn.mock.calls[0].arguments, [undefined, undefined]);
	});

	describe('date question integration', () => {
		it('should extract date using getDataToSave when useBodyValues is true', async () => {
			const validationFn = mock.fn(() => true);
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: validationFn,
				useBodyValues: true
			});
			const questionObj = createMockDateQuestion('dateField');
			const req = createMockRequest({});
			req.body = {
				dateField_day: '15',
				dateField_month: '6',
				dateField_year: '2026',
				other: 'dependency-value'
			};
			const chain = validator.validate(questionObj);
			await chain[0].run(req);

			const [currentAnswer, dependencyAnswer] = validationFn.mock.calls[0].arguments;
			assert.ok(currentAnswer instanceof Date, 'currentAnswer should be a Date');
			assert.strictEqual(currentAnswer.getFullYear(), 2026);
			assert.strictEqual(currentAnswer.getMonth() + 1, 6);
			assert.strictEqual(currentAnswer.getDate(), 15);
			assert.strictEqual(dependencyAnswer, 'dependency-value');
		});

		it('should propagate error when getDataToSave throws (e.g. incomplete date fields)', async () => {
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: () => true,
				useBodyValues: true
			});
			const questionObj = createMockDateQuestion('dateField');
			const req = createMockRequest({});
			req.body = {
				dateField_day: '15',
				dateField_month: '6',
				// missing year
				other: 'dependency-value'
			};
			const chain = validator.validate(questionObj);
			const result = await chain[0].run(req);
			assert.strictEqual(result.isEmpty(), false);
			assert.match(result.array()[0].msg, /Incomplete date fields/);
		});

		it('should use JourneyResponse answer directly when useBodyValues is false', async () => {
			const storedDate = new Date('2026-06-15T00:00:00.000Z');
			const validationFn = mock.fn(() => true);
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: validationFn
			});
			const questionObj = createMockDateQuestion('dateField');
			const req = createMockRequest({ dateField: storedDate, other: 'dependency-value' });
			req.body = { dateField_day: '15' };
			const chain = validator.validate(questionObj, req.res.locals.journeyResponse);
			await chain[0].run(req);

			const [currentAnswer, dependencyAnswer] = validationFn.mock.calls[0].arguments;
			assert.strictEqual(currentAnswer, storedDate);
			assert.strictEqual(dependencyAnswer, 'dependency-value');
		});
	});

	describe('date-period question integration', () => {
		it('should extract date period using getDataToSave when useBodyValues is true', async () => {
			const validationFn = mock.fn(() => true);
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: validationFn,
				useBodyValues: true
			});
			const questionObj = createMockDatePeriodQuestion('periodField');
			const req = createMockRequest({});
			req.body = {
				periodField_start_day: '1',
				periodField_start_month: '6',
				periodField_start_year: '2026',
				periodField_end_day: '30',
				periodField_end_month: '6',
				periodField_end_year: '2026',
				other: 'dependency-value'
			};
			const chain = validator.validate(questionObj);
			await chain[0].run(req);

			const [currentAnswer, dependencyAnswer] = validationFn.mock.calls[0].arguments;
			assert.ok(currentAnswer.start instanceof Date, 'start should be a Date');
			assert.ok(currentAnswer.end instanceof Date, 'end should be a Date');
			assert.strictEqual(currentAnswer.start.getDate(), 1);
			assert.strictEqual(currentAnswer.end.getDate(), 30);
			assert.strictEqual(dependencyAnswer, 'dependency-value');
		});

		it('should propagate error when getDataToSave throws for incomplete start date', async () => {
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: () => true,
				useBodyValues: true
			});
			const questionObj = createMockDatePeriodQuestion('periodField');
			const req = createMockRequest({});
			req.body = {
				periodField_start_day: '1',
				// missing start month and year
				periodField_end_day: '30',
				periodField_end_month: '6',
				periodField_end_year: '2026',
				other: 'dependency-value'
			};
			const chain = validator.validate(questionObj);
			const result = await chain[0].run(req);
			assert.strictEqual(result.isEmpty(), false);
			assert.match(result.array()[0].msg, /Incomplete start date fields/);
		});

		it('should propagate error when getDataToSave throws for incomplete end date', async () => {
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: () => true,
				useBodyValues: true
			});
			const questionObj = createMockDatePeriodQuestion('periodField');
			const req = createMockRequest({});
			req.body = {
				periodField_start_day: '1',
				periodField_start_month: '6',
				periodField_start_year: '2026',
				periodField_end_day: '30',
				// missing end month and year
				other: 'dependency-value'
			};
			const chain = validator.validate(questionObj);
			const result = await chain[0].run(req);
			assert.strictEqual(result.isEmpty(), false);
			assert.match(result.array()[0].msg, /Incomplete end date fields/);
		});

		it('should use JourneyResponse answer directly when useBodyValues is false', async () => {
			const storedPeriod = {
				start: new Date('2026-06-01T00:00:00.000Z'),
				end: new Date('2026-06-30T00:00:00.000Z')
			};
			const validationFn = mock.fn(() => true);
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: validationFn
			});
			const questionObj = createMockDatePeriodQuestion('periodField');
			const req = createMockRequest({ periodField: storedPeriod, other: 'dependency-value' });
			req.body = { periodField_start_day: '1' };
			const chain = validator.validate(questionObj, req.res.locals.journeyResponse);
			await chain[0].run(req);

			const [currentAnswer, dependencyAnswer] = validationFn.mock.calls[0].arguments;
			assert.strictEqual(currentAnswer, storedPeriod);
			assert.strictEqual(dependencyAnswer, 'dependency-value');
		});
	});

	describe('useBodyValuesForCurrent', () => {
		it('should set useBodyValuesForCurrent property correctly', () => {
			const validator1 = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: () => true,
				useBodyValuesForCurrent: true
			});
			assert.strictEqual(validator1.useBodyValuesForCurrent, true);

			const validator2 = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: () => true,
				useBodyValues: true
			});
			assert.strictEqual(validator2.useBodyValuesForCurrent, true);

			const validator3 = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: () => true
			});
			assert.strictEqual(validator3.useBodyValuesForCurrent, false);
		});

		it('should use body value for current and JourneyResponse value for dependency when useBodyValuesForCurrent is true', async () => {
			const validationFn = mock.fn(() => true);
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: validationFn,
				useBodyValuesForCurrent: true
			});
			const questionObj = createMockQuestion('field');
			const req = createMockRequest({ field: 'from-journey-response', other: 'from-journey-response-dependency' });
			req.body = { field: 'from-body', other: 'from-body-dependency' };
			const chain = validator.validate(questionObj, req.res.locals.journeyResponse);
			await chain[0].run(req);

			const [currentAnswer, dependencyAnswer] = validationFn.mock.calls[0].arguments;
			assert.strictEqual(currentAnswer, 'from-body');
			assert.strictEqual(dependencyAnswer, 'from-journey-response-dependency');
		});

		it('should use body values for both current and dependency when useBodyValues is true', async () => {
			const validationFn = mock.fn(() => true);
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: validationFn,
				useBodyValues: true
			});
			const questionObj = createMockQuestion('field');
			const req = createMockRequest({ field: 'from-journey-response', other: 'from-journey-response-dependency' });
			req.body = { field: 'from-body', other: 'from-body-dependency' };
			const chain = validator.validate(questionObj, req.res.locals.journeyResponse);
			await chain[0].run(req);

			const [currentAnswer, dependencyAnswer] = validationFn.mock.calls[0].arguments;
			assert.strictEqual(currentAnswer, 'from-body');
			assert.strictEqual(dependencyAnswer, 'from-body-dependency');
		});

		it('should use JourneyResponse value for current when useBodyValuesForCurrent is false', async () => {
			const validationFn = mock.fn(() => true);
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: validationFn,
				useBodyValuesForCurrent: false
			});
			const questionObj = createMockQuestion('field');
			const req = createMockRequest({ field: 'from-journey-response', other: 'from-journey-response-dependency' });
			req.body = { field: 'from-body', other: 'from-body-dependency' };
			const chain = validator.validate(questionObj, req.res.locals.journeyResponse);
			await chain[0].run(req);

			const [currentAnswer, dependencyAnswer] = validationFn.mock.calls[0].arguments;
			assert.strictEqual(currentAnswer, 'from-journey-response');
			assert.strictEqual(dependencyAnswer, 'from-journey-response-dependency');
		});

		it('should fallback to req.body[fieldName] when getDataToSave is not available', async () => {
			const validationFn = mock.fn(() => true);
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: validationFn,
				useBodyValuesForCurrent: true
			});
			// Question without getDataToSave method
			const questionObj = {
				fieldName: 'field'
			};
			const req = createMockRequest({ field: 'from-journey-response', other: 'from-journey-response-dependency' });
			req.body = { field: 'from-body', other: 'from-body-dependency' };
			const chain = validator.validate(questionObj, req.res.locals.journeyResponse);
			await chain[0].run(req);

			const [currentAnswer, dependencyAnswer] = validationFn.mock.calls[0].arguments;
			assert.strictEqual(currentAnswer, 'from-body');
			assert.strictEqual(dependencyAnswer, 'from-journey-response-dependency');
		});

		it('should return all formatted answers when fieldName is not in formattedAnswers', async () => {
			const validationFn = mock.fn(() => true);
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'otherField',
				validationFunction: validationFn,
				useBodyValues: true
			});
			// Mock a behavior where getDataToSave returns answers keyed by input
			// field names, not the question's fieldName
			const questionObj = {
				fieldName: 'contactDetails', // This won't be in formattedAnswers
				bodyFieldNames: ['email', 'phone'],
				getDataToSave: async (req) => ({
					answers: {
						// Returns individual input fields, not 'contactDetails'
						email: req.body.email,
						phone: req.body.phone
					}
				})
			};
			const req = createMockRequest({});
			req.body = {
				contactDetails: 'ignored',
				email: 'test@example.com',
				phone: '123456789',
				otherField: 'dependency-value'
			};
			const chain = validator.validate(questionObj);
			await chain[0].run(req);

			const [currentAnswer, dependencyAnswer] = validationFn.mock.calls[0].arguments;
			// Should receive all formatted answers since 'contactDetails' is not in formattedAnswers
			assert.deepStrictEqual(currentAnswer, {
				email: 'test@example.com',
				phone: '123456789'
			});
			assert.strictEqual(dependencyAnswer, 'dependency-value');
		});
	});

	describe('bodyFieldNames getter support', () => {
		it('should use bodyFieldNames[0] when question provides it', async () => {
			const validationFn = mock.fn(() => true);
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: validationFn
			});
			// Mock question with custom bodyFieldNames getter
			const questionObj = {
				fieldName: 'customField',
				bodyFieldNames: ['customField_first', 'customField_second'],
				getDataToSave: async (req) => ({
					answers: {
						customField: req.body.customField_first + '-' + req.body.customField_second
					}
				})
			};
			const req = createMockRequest({ customField: 'stored-value', other: 'dep-value' });
			req.body = {
				customField_first: 'a',
				customField_second: 'b',
				other: 'body-dep'
			};
			const chain = validator.validate(questionObj, req.res.locals.journeyResponse);
			await chain[0].run(req);

			// Should have called validation function with stored answer since useBodyValuesForCurrent is false
			assert.deepEqual(validationFn.mock.calls[0].arguments, ['stored-value', 'dep-value']);
		});

		it('should fallback to fieldName when bodyFieldNames is not available', async () => {
			const validationFn = mock.fn(() => true);
			const validator = new CrossQuestionValidator({
				dependencyFieldName: 'other',
				validationFunction: validationFn
			});
			// Question without bodyFieldNames getter
			const questionObj = {
				fieldName: 'simpleField'
			};
			const req = createMockRequest({ simpleField: 'stored-value', other: 'dep-value' });
			req.body = {
				simpleField: 'body-value'
			};
			const chain = validator.validate(questionObj, req.res.locals.journeyResponse);
			await chain[0].run(req);

			assert.deepEqual(validationFn.mock.calls[0].arguments, ['stored-value', 'dep-value']);
		});
	});
});
