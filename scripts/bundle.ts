import { bundle } from 'https://deno.land/x/emit/mod.ts';

const entryPoint = `${Deno.cwd()}/${Deno.args[0]}`;
const outfile = `${Deno.cwd()}/${Deno.args[1]}`;

console.log(`entryPoint: ${entryPoint}`);
console.log(`outfile: ${outfile}`);

const { code } = await bundle(entryPoint);
Deno.writeTextFile(outfile, code);
