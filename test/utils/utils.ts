import path from 'path';
import { mock, type TestContext } from 'node:test';

export function testDir() {
	return path.join(import.meta.dirname, '..');
}

export function snapshotsDir() {
	return path.join(testDir(), 'snapshots');
}

export function assertSnapshot(ctx: TestContext, content: string, name: string) {
	ctx.assert.fileSnapshot(
		content.replaceAll('\r\n', '\n'), // OS agnostic line endings
		path.join(snapshotsDir(), name),
		{
			serializers: [(v) => v]
		}
	);
}

export const mockReq = () => ({
	params: {},
	body: {},
	originalUrl: '/original-url'
});
export const mockRes = () => {
	const res = {
		locals: {},
		redirect: mock.fn(),
		status: mock.fn(),
		render: mock.fn(),
		send: mock.fn()
	};
	res.status.mock.mockImplementation(() => res);
	res.send.mock.mockImplementation(() => res);

	return res;
};

/**
 * escapes all RegExp meta-characters in a string
 */
export function escapeForRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
