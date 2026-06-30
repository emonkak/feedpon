import * as fs from 'node:fs/promises';
import * as esbuild from 'esbuild';
import { minifyTemplates } from 'esbuild-plugin-minify-templates';

const isProduction = process.env.NODE_ENV === 'production';
const configs: esbuild.BuildOptions[] = [
  {
    bundle: true,
    entryPoints: ['assets/css/main.css'],
    logLevel: 'info',
    outfile: 'dist/css/main.css',
  },
  {
    bundle: true,
    dropLabels: isProduction ? ['DEBUG'] : [],
    entryPoints: ['packages/feedpon/src/main.ts'],
    logLevel: 'info',
    metafile: true,
    outfile: 'dist/js/main.js',
    plugins: [minifyTemplates()],
  },
  {
    bundle: true,
    entryPoints: ['packages/feedpon/src/background.ts'],
    logLevel: 'info',
    outfile: 'dist/js/background.js',
  },
];

for (const result of await Promise.all(
  configs.map((config) => esbuild.build(config)),
)) {
  if (result.metafile !== undefined) {
    await fs.writeFile('meta.json', JSON.stringify(result.metafile));
  }
}
