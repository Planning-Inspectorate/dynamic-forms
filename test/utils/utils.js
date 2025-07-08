import path from 'path';

export function testDir() {
	return path.join(path.dirname(new URL(import.meta.url).pathname), '..');
}

export function snapshotsDir() {
	return path.join(testDir(), 'snapshots');
}
