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
		const questionObj = { fieldName: 'field' };
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
		const questionObj = { fieldName: 'field' };
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
		const questionObj = { fieldName: 'field' };
		const chain = validator.validate(questionObj);
		const req = { res: { locals: {} } };
		await chain[0].run(req);
		assert.deepEqual(validationFn.mock.calls[0].arguments, [undefined, undefined]);
	});

	it('should use session answers instead of request body values when useBodyValues is false', async () => {
		const validationFn = mock.fn(() => true);
		const validator = new CrossQuestionValidator({
			dependencyFieldName: 'other',
			validationFunction: validationFn
		});
		const questionObj = { fieldName: 'field' };
		const req = createMockRequest({ field: 'from-session', other: 'from-session-dependency' });
		req.body = { field: 'from-body', other: 'from-body-dependency' };
		const chain = validator.validate(questionObj, req.res.locals.journeyResponse);
		await chain[0].run(req);
		assert.deepEqual(validationFn.mock.calls[0].arguments, ['from-session', 'from-session-dependency']);
	});

	it('should use request body values when useBodyValues is true', async () => {
		const validationFn = mock.fn(() => true);
		const validator = new CrossQuestionValidator({
			dependencyFieldName: 'other',
			useBodyValues: true,
			validationFunction: validationFn
		});
		const questionObj = { fieldName: 'field' };
		const chain = validator.validate(questionObj);
		const req = createMockRequest({ field: 'from-session', other: 'from-session-dependency' });
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
		const questionObj = { fieldName: 'field' };
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
		const questionObj = { fieldName: 'field' };
		const chain = validator.validate(questionObj);
		const req = { res: { locals: { journeyResponse: {} } } };
		await chain[0].run(req);
		assert.deepEqual(validationFn.mock.calls[0].arguments, [undefined, undefined]);
	});
});
