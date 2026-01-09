import { describe, it } from 'node:test';
import assert from 'node:assert';
import { trimTrailingSlash } from '#src/lib/utils.js';

describe('utils', () => {
	describe('trimTrailingSlash', () => {
		it('should trim a trailing slash', () => {
			assert.strictEqual(trimTrailingSlash('my-url.com/hello/'), 'my-url.com/hello');
		});
		it('should do nothing if no trailing slash', () => {
			assert.strictEqual(trimTrailingSlash('my-url.com/hello'), 'my-url.com/hello');
		});
		it('should return non-string types', () => {
			assert.strictEqual(trimTrailingSlash(null), null);
			assert.strictEqual(trimTrailingSlash(undefined), undefined);
			assert.strictEqual(trimTrailingSlash(5), 5);
		});
	});
});
