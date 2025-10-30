import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validationResult } from 'express-validator';
import SameAnswerValidator from './same-answer-validator.js';

describe('./src/dynamic-forms/validator/same-answer-validator.js', () => {
	it('should return an error if the answer is the same as the compared field', async () => {
		const req = {
			body: { questionTwo: 'Test-answer' },
			res: {
				locals: {
					journeyResponse: {
						answers: { questionOne: 'Test-answer' }
					}
				}
			}
		};

		const validator = new SameAnswerValidator(['questionOne'], 'Answers must be different');
		const middleware = validator.validate({ fieldName: 'questionTwo' });

		await middleware(req, {}, () => {});
		const result = validationResult(req);

		assert.strictEqual(result.isEmpty(), false);
		assert.strictEqual(result.array()[0].msg, 'Answers must be different');
	});
	it('should continue if the answer is different to the compared field', async () => {
		const req = {
			body: { questionTwo: 'Test-answer' },
			res: {
				locals: {
					journeyResponse: {
						answers: { questionOne: 'Test-answer-different' }
					}
				}
			}
		};

		const validator = new SameAnswerValidator(['questionOne'], 'Answers must be different');
		const middleware = validator.validate({ fieldName: 'questionTwo' });

		await middleware(req, {}, () => {});
		const result = validationResult(req);

		assert.strictEqual(result.isEmpty(), true);
		assert.strictEqual(result.array().length, 0);
	});
});
