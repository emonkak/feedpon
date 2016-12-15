var IgnorePlugin = require('webpack/lib/IgnorePlugin');
var path = require('path');
var postcssCssnext = require('postcss-cssnext');
var postcssImport = require('postcss-import');

module.exports = {
    entry: {
        'app': './src/app.tsx',
        'background': './src/background.ts'
    },
    output: {
        path: './app/chrome/js',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['', '.ts', '.tsx', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            }
        ]
    },
    plugins: [
        new IgnorePlugin(/^crypto$/)
    ],
    postcss: function() {
        return [postcssImport, postcssCssnext];
    }
};
