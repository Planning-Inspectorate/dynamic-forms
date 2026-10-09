import { randomUUID } from 'node:crypto';

/**
 * Wrapper class so it can be overridden by test mocks
 */
export class Uuid {
	static randomUUID() {
		return randomUUID();
	}
}
