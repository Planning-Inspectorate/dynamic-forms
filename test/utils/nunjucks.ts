import nunjucks from 'nunjucks';
import { createRequire } from 'module';
import path from 'path';
import { testDir as getTestDir } from './utils.ts';

export function configureNunjucksTestEnv() {
	const require = createRequire(import.meta.url);
	const testDir = getTestDir();
	// load the dist directory if testing the built package with TEST_DIST env var
	const srcDir = path.resolve(testDir, '..', process.env.TEST_DIST ? 'dist' : 'src');
	const govukFrontendRoot = path.resolve(require.resolve('govuk-frontend'), '../..');

	return nunjucks.configure([testDir, srcDir, govukFrontendRoot], {
		// output with dangerous characters are escaped automatically
		autoescape: true,
		// automatically remove trailing newlines from a block/tag
		trimBlocks: true,
		// automatically remove leading whitespace from a block/tag
		lstripBlocks: true
	});
}
