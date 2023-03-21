import { bundle } from 'https://deno.land/x/emit/mod.ts';

const entryPoint = './mod.ts';
const outFile = './mod.bundle.js';

const { code } = await bundle(new URL(import.meta.resolve(entryPoint)));
Deno.writeTextFile(outFile, code);
