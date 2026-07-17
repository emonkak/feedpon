import * as fs from 'node:fs/promises';
import * as esbuild from 'esbuild';
import { minifyTemplates } from 'esbuild-plugin-minify-templates';

const isProduction = process.env.NODE_ENV === 'production';
const configs: esbuild.BuildOptions[] = [
  {
    bundle: true,
    entryPoints: ['app/css/app.css'],
    logLevel: 'info',
    outfile: 'dist/app.css',
  },
  {
    bundle: true,
    dropLabels: isProduction ? ['DEBUG'] : [],
    entryPoints: ['app/src/app.ts'],
    logLevel: 'info',
    metafile: !isProduction,
    outfile: 'dist/app.js',
    plugins: [minifyTemplates()],
  },
  {
    bundle: true,
    entryPoints: ['app/src/background.ts'],
    logLevel: 'info',
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
