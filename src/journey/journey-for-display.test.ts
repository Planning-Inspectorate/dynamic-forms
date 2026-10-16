import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JourneyForDisplay } from './journey-for-display.ts';

describe('journey-for-display', () => {
	describe('responseForSection', () => {
		it('should always return the given response', () => {
			const answers = { hello: 'world' };
			const journey = new JourneyForDisplay(answers);
			assert.strictEqual(journey.responseForSection()?.answers, answers);
		});
	});
});
