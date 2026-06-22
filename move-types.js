import { copyFile } from 'node:fs/promises';
import path from 'path';

const filesToCopy = ['questions/question-props.d.ts', 'questions/question-types.d.ts', 'journey/journey-types.d.ts'];

// copy some of the type definition files to the types output that are not automatically included
for (const file of filesToCopy) {
	const src = path.join(import.meta.dirname, 'src', file);
	const dest = path.join(import.meta.dirname, 'types', 'src', file);
	await copyFile(src, dest);
	console.log(`Copied ${src} to ${dest}`);
}
