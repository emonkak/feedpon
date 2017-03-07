const path = require('path');

const config = {
    entry: {
        'index': './src/index.tsx'
    },
    output: {
        path: './public/js',
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
                loader: 'ts-loader'
            }
        ]
    },
    plugins: []
};

if (process.env.NODE_ENV === 'production') {
    const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

    config.plugins.push(new UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }));
}

module.exports = config;
