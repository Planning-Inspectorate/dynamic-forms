import { copyFile } from 'node:fs/promises';
import path from 'path';

async function copyAndOverwrite(src, dest) {
	await copyFile(src, dest);
	console.log(`Copied ${src} to ${dest}`);
}

const srcDir = path.join(import.meta.dirname, 'src', 'questions');
const typesDir = path.join(import.meta.dirname, 'types', 'src', 'questions');

// copy some of the type definition files to the types output that are not automatically included
copyAndOverwrite(path.join(srcDir, 'question-props.d.ts'), path.join(typesDir, 'question-props.d.ts'));
copyAndOverwrite(path.join(srcDir, 'question-types.d.ts'), path.join(typesDir, 'question-types.d.ts'));
