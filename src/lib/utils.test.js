import { describe, it } from 'node:test';
import assert from 'node:assert';
import { toArray, trimTrailingSlash } from '#src/lib/utils.js';

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
	describe('toArray', () => {
		it('should create an array if a value is provided', () => {
			const values = [true, false, 'string', 123, null, { hello: 'world' }];
			for (const value of values) {
				const asArray = toArray(value);
				assert.ok(Array.isArray(asArray));
				assert.strictEqual(asArray.length, 1);
				assert.strictEqual(asArray[0], value);
			}
		});
		it('should leave an array as-is', () => {
			const array = [1, 'string', 2];
			const asArray = toArray(array);
			assert.strictEqual(array, asArray);
		});
	});
});
