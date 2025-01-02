import * as fs from 'node:fs/promises';
import * as esbuild from 'esbuild';

const isProduction = process.env.NODE_ENV === 'production';
const dropLabels = isProduction ? ['DEBUG'] : [];

const configs = [
  {
    entryPoints: ['packages/feedpon/src/index.ts'],
    bundle: true,
    metafile: !isProduction,
    outfile: 'dist/index.js',
    dropLabels,
  },
  {
    entryPoints: ['packages/feedpon/src/background.ts'],
    bundle: true,
    outfile: 'dist/background.js',
    dropLabels,
  },
];

for (const result of await Promise.all(
  configs.map((config) => esbuild.build(config)),
)) {
  if (result.metafile !== undefined) {
    await fs.writeFile('dist/meta.json', JSON.stringify(result.metafile));
  }
}
