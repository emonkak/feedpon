import * as fs from 'node:fs/promises';
import * as esbuild from 'esbuild';

/**
 * @type esbuild.Plugin
 */
const reactCommentsAsDomContainersFeaturePlugin = {
  name: 'reactCommentsAsDomContainersFeaturePlugin',
  setup(build) {
    build.onLoad(
      {
        filter: /\/react-dom\.(?:development|production)\.js$/,
        namespace: 'file',
      },
      async (args) => {
        const contents = (await fs.readFile(args.path, 'utf-8')).replace(
          'var disableCommentsAsDOMContainers = true;',
          'var disableCommentsAsDOMContainers = false;',
        );
        return {
          contents,
          loader: 'js',
        };
      },
    );
  },
};

await esbuild.build({
  entryPoints: ['packages/feedpon/src/index.tsx'],
  bundle: true,
  outfile: 'dist/index.js',
  dropLabels: process.env.NODE_ENV === 'production' ? ['DEBUG'] : [],
  plugins: [reactCommentsAsDomContainersFeaturePlugin],
});
