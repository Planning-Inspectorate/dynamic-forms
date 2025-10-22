import path from 'path';
import { mock } from 'node:test';

export function testDir() {
	return path.join(path.dirname(new URL(import.meta.url).pathname), '..');
}

export function snapshotsDir() {
	return path.join(testDir(), 'snapshots');
}

/**
 * @returns {import('pino').BaseLogger}
 */
export function mockLogger() {
	return {
		level: 'debug',
		silent: mock.fn(),
		trace: mock.fn(),
		info: mock.fn(),
		debug: mock.fn(),
		warn: mock.fn(),
		error: mock.fn(),
		fatal: mock.fn()
	};
}

export const mockReq = () => ({
	log: mockLogger(),
	params: {},
	body: {}
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
 * @param {string} s
 * @returns {string}
 */
export function escapeForRegExp(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
