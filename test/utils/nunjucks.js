import nunjucks from 'nunjucks';
import { createRequire } from 'module';
import path from 'path';
import { testDir as getTestDir } from './utils.js';

export function configureNunjucksTestEnv() {
	const require = createRequire(import.meta.url);
	const testDir = getTestDir();
	const srcDir = path.resolve(testDir, '..', 'src');
	const govukFrontendRoot = path.resolve(require.resolve('govuk-frontend'), '../..');

	const env = nunjucks.configure([testDir, srcDir, govukFrontendRoot], {
		// output with dangerous characters are escaped automatically
		autoescape: true,
		// automatically remove trailing newlines from a block/tag
		trimBlocks: true,
		// automatically remove leading whitespace from a block/tag
		lstripBlocks: true
	});
	env.addGlobal('govukRebrand', true);
	return env;
}
