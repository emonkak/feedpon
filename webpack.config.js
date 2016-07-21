var IgnorePlugin = require('webpack/lib/IgnorePlugin');
var path = require('path');
var postcssCssnext = require('postcss-cssnext');
var postcssImport = require('postcss-import');

module.exports = {
    entry: {
        'app': './src/js/app.js',
        'background': './src/js/background.js'
    },
    output: {
        path: './app/chrome/js',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['', '.ts', '.js'],
        alias: {
            localforage: require.resolve('localforage/src/localforage')
        }
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'node_modules/localforage'),
                loader: 'babel-loader?cacheDirectory=true&babelrc=false&plugins=transform-es2015-modules-commonjs'
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            },
            {
                test: /\.js$/,
                exclude: path.resolve(__dirname, 'node_modules'),
                loader: 'babel-loader?cacheDirectory=true'
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
