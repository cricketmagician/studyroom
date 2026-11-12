import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
await build({entryPoints:[root+'functions/src/index.ts'],outfile:root+'functions/lib/index.js',bundle:true,platform:'node',target:'node22',format:'cjs',packages:'external'});
console.log('Built PDF processing functions.');
