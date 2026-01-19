import { Uuid } from '#src/lib/uuid.js';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('uuid', () => {
	it('should return a valid v4 UUID', () => {
		assert.match(
			Uuid.randomUUID(),
			/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
		);
	});
});
