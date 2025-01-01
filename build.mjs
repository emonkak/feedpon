import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['packages/feedpon/src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  dropLabels: process.env.NODE_ENV === 'production' ? ['DEBUG'] : [],
});
