const path = require('path');

const config = {
    entry: {
        'background': './src/background.ts',
        'index': './src/index.tsx',
        'runtime': './src/runtime.ts'
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js'
    },
    resolve: {
        modules: [
            path.join(__dirname, 'src'),
            'node_modules'
        ],
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                include: path.join(__dirname, 'node_modules', '@emonkak', 'enumerable'),
                use: [
                    'babel-loader'
                ]
            },
            {
                test: /\.tsx?$/,
                use: [
                    'babel-loader',
                    'ts-loader'
                ]
            }
        ]
    },
    plugins: []
};

if (process.env.NODE_ENV === 'production') {
    const DefinePlugin = require('webpack/lib/DefinePlugin');
    const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

    config.plugins.push(new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
    }));

    config.plugins.push(new UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }));
}

module.exports = config;
