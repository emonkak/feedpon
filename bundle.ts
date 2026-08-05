import * as fs from 'node:fs/promises';
import * as esbuild from 'esbuild';
import { minifyTemplates } from 'esbuild-plugin-minify-templates';

const isProduction = process.env.NODE_ENV === 'production';
const isWatch = process.argv.includes('--watch');
const configs: esbuild.BuildOptions[] = [
  {
    bundle: true,
    entryPoints: ['src/app.css'],
    logLevel: 'info',
    outfile: 'dist/css/app.css',
  },
  {
    bundle: true,
    dropLabels: isProduction ? ['DEBUG'] : [],
    entryPoints: ['src/app.ts'],
    logLevel: 'info',
    metafile: !isProduction,
    outfile: 'dist/js/app.js',
    plugins: [minifyTemplates()],
  },
  {
    bundle: true,
    entryPoints: ['src/background.ts'],
    logLevel: 'info',
    outfile: 'dist/js/background.js',
  },
];

await main();

async function main(): Promise<void> {
  const bundle = isWatch ? watchSource : buildSource;
  const promises: Promise<void>[] = [];

  for (const config of configs) {
    promises.push(bundle(config));
  }

  await Promise.all(promises);
}

async function buildSource(config: esbuild.BuildOptions) {
  const result = await esbuild.build(config);
  if (result.metafile !== undefined) {
    await fs.writeFile('meta.json', JSON.stringify(result.metafile));
  }
}

async function watchSource(config: esbuild.BuildOptions): Promise<void> {
  const context = await esbuild.context(config);
  await context.watch();
}
