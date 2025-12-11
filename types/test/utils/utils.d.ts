export function testDir(): any;
export function snapshotsDir(): any;
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
};
export function mockRes(): {
	locals: {};
	redirect: any;
	status: any;
	render: any;
	send: any;
};
