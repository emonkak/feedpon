import * as fs from 'node:fs/promises';
import * as esbuild from 'esbuild';

const isProduction = process.env.NODE_ENV === 'production';

const result = await esbuild.build({
  entryPoints: ['packages/feedpon/src/index.ts'],
  bundle: true,
  metafile: !isProduction,
  outfile: 'dist/index.js',
  dropLabels: isProduction ? ['DEBUG'] : [],
});

if (!isProduction) {
  await fs.writeFile('dist/meta.json', JSON.stringify(result.metafile));
}
