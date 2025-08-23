import * as fs from 'node:fs/promises';
import * as esbuild from 'esbuild';
import { minifyTemplates } from 'esbuild-plugin-minify-templates';

const isProduction = process.env.NODE_ENV === 'production';
const configs = [
  {
    bundle: true,
    entryPoints: ['assets/css/index.css'],
    outfile: 'dist/index.js',
  },
  {
    bundle: true,
    dropLabels: isProduction ? ['DEBUG'] : [],
    entryPoints: ['packages/feedpon/src/index.ts'],
    keepNames: true,
    metafile: !isProduction,
    outfile: 'dist/index.js',
    plugins: [minifyTemplates()],
  },
  {
    bundle: true,
    entryPoints: ['packages/feedpon/src/background.ts'],
    outfile: 'dist/background.js',
  },
];

for (const result of await Promise.all(
  configs.map((config) => esbuild.build(config)),
)) {
  if (result.metafile !== undefined) {
    await fs.writeFile('dist/meta.json', JSON.stringify(result.metafile));
  }
}
