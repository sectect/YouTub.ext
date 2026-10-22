import { build } from 'esbuild';
import { zipSync } from 'fflate';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const manifest = JSON.parse(await readFile('public/manifest.json', 'utf8'));
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
if (!/^\d+(?:\.\d+){0,3}$/.test(manifest.version) || manifest.version !== pkg.version) {
  throw new Error('Use the same numeric version in package.json and public/manifest.json.');
}
const folder = `youtub-ext-v${manifest.version}`;
const outdir = resolve('dist', folder);
await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });
await cp('public', outdir, { recursive: true });
await cp('LICENSE', join(outdir, 'LICENSE'));
await build({
  entryPoints: ['src/features/content.ts', 'src/popup/main.ts'],
  outdir,
  entryNames: '[name]',
  bundle: true,
  target: 'chrome110',
  format: 'iife',
  minify: true,
});
console.log(`Built dist/${folder}/`);

const entries = await readdir(outdir, { recursive: true, withFileTypes: true });
const files = await Promise.all(entries.filter(entry => entry.isFile()).map(async entry => {
  const path = join(entry.parentPath, entry.name);
  return [relative(outdir, path).replaceAll('\\', '/'), new Uint8Array(await readFile(path))];
}));
await mkdir('release', { recursive: true });
await writeFile(`release/${folder}.zip`, zipSync(Object.fromEntries(files), { level: 9 }));
console.log(`Packaged release/${folder}.zip`);
