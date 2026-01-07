import path from 'path';
import nunjucks from 'nunjucks';

/**
 * Returns a nunjucks environment configured with the `src` folder
 * @returns {import('nunjucks').Environment}
 */
export function nunjucksEnv() {
	const utilsDir = path.dirname(new URL(import.meta.url).pathname);
	const srcDir = path.resolve(utilsDir, '..', '..');

	return nunjucks.configure([srcDir], {
		// output with dangerous characters are escaped automatically
		autoescape: true,
		// automatically remove trailing newlines from a block/tag
		trimBlocks: true,
		// automatically remove leading whitespace from a block/tag
		lstripBlocks: true
	});
}
