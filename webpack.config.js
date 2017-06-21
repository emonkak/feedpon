const path = require('path');

const config = {
    entry: {
        'background': './src/background.ts',
        'index': './src/index.tsx',
        'perf': 'react-addons-perf'
    },
    output: {
        path: path.join(__dirname, 'public', 'js'),
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
            },
            {
                test: require.resolve('react-addons-perf'),
                use: [
                    {
                        loader: 'expose-loader',
                        options: 'Perf'
                    }
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
