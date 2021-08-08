const path = require('path');
const DefinePlugin = require('webpack/lib/DefinePlugin');

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const config = {
    mode: 'none',
    entry: {
        'background': './src/background.ts',
        'index': './src/index.tsx',
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
                test: /\.tsx?$/,
                use: [
                    'ts-loader'
                ]
            }
        ]
    },
    plugins: [
        new DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env)
        })
    ]
};

module.exports = config;
