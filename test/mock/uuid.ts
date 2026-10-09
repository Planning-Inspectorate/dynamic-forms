import { Uuid } from '#pkg-for-tests';
import type { TestContext } from 'node:test';

type UuidType = ReturnType<typeof Uuid.randomUUID>;

export function mockRandomUUID(ctx: TestContext, uuid: UuidType = '00000000-0000-0000-0000-000000000000') {
	const original = Uuid.randomUUID;
	Uuid.randomUUID = ctx.mock.fn(() => uuid);
	// restore after the tests
	ctx.after(() => (Uuid.randomUUID = original));
}
