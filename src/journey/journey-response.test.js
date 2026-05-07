import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JourneyResponse } from './journey-response.js';

describe('JourneyResponse class', () => {
	describe('constructor', () => {
		it('should handle instantiation with no args to constructor', () => {
			const response = new JourneyResponse();
			assert.strictEqual(response.journeyId, undefined);
			assert.strictEqual(response.referenceId, undefined);
			assert.deepStrictEqual(response.answers, {});
		});

		it('should set journeyId when passed into constructor', () => {
			const ref = 'test';
			const response = new JourneyResponse(ref);
			assert.strictEqual(response.journeyId, ref);
		});

		it('should set referenceId when passed into constructor', () => {
			const ref = 'test';
			const response = new JourneyResponse('', ref);
			assert.strictEqual(response.referenceId, ref);
		});

		it('should set answers when passed into constructor', () => {
			const answers = [1, 2];
			const response = new JourneyResponse('', '', answers);
			assert.strictEqual(response.answers, answers);
		});

		it('should not set LPACode when lpaCode is omitted', () => {
			const response = new JourneyResponse('journey-1', 'ref-1', { q1: 'yes' });
			assert.strictEqual(response.LPACode, undefined);
			assert.strictEqual(Object.hasOwn(response, 'LPACode'), false);
		});

		it('should set LPACode when lpaCode is provided', () => {
			const lpaCode = 'LPA-001';
			const response = new JourneyResponse('journey-1', 'ref-1', { q1: 'yes' }, lpaCode);
			assert.strictEqual(response.LPACode, lpaCode);
			assert.strictEqual(Object.hasOwn(response, 'LPACode'), true);
		});
	});
});
