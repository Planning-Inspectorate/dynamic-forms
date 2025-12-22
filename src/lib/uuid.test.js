import { Uuid } from '#src/lib/uuid.js';

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
