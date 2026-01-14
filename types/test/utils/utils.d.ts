export function testDir(): string;
export function snapshotsDir(): string;
/**
 * @returns {import('pino').BaseLogger}
 */
export function mockLogger(): any;
/**
 * escapes all RegExp meta-characters in a string
 * @param {string} s
 * @returns {string}
 */
export function escapeForRegExp(s: string): string;
export function mockReq(): {
	log: any;
	params: {};
	body: {};
	originalUrl: string;
};
export function mockRes(): {
	locals: {};
	redirect: import('node:test').Mock<(...args: any[]) => undefined>;
	status: import('node:test').Mock<(...args: any[]) => undefined>;
	render: import('node:test').Mock<(...args: any[]) => undefined>;
	send: import('node:test').Mock<(...args: any[]) => undefined>;
};
//# sourceMappingURL=utils.d.ts.map
