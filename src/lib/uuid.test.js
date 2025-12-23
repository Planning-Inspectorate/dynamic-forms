import { Uuid } from '#src/lib/uuid.js';
import { describe, it } from 'node:test';
import assert from 'node:assert';

/**
 *
 * @param {import('node:test').TestContext} ctx
 * @param {string} [uuid]
 */
export function mockRandomUUID(ctx, uuid = '00000000-0000-0000-0000-000000000000') {
	const original = Uuid.randomUUID;
	Uuid.randomUUID = ctx.mock.fn(() => uuid);
	// restore after the tests
	ctx.after(() => (Uuid.randomUUID = original));
}

describe('uuid', () => {
	it('should return a valid v4 UUID', () => {
		assert.match(
			Uuid.randomUUID(),
			/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
		);
	});
});
