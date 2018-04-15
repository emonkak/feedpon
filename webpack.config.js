const path = require('path');

const config = {
    mode: 'none',
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
                    'ts-loader'
                ]
            }
        ]
    },
    plugins: []
};

if (process.env.NODE_ENV === 'production') {
    const DefinePlugin = require('webpack/lib/DefinePlugin');

    config.plugins.push(new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
    }));
}

module.exports = config;
