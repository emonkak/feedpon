const path = require('path');

module.exports = {
    entry: {
        'index': './src/index.tsx'
    },
    output: {
        path: './public/js',
        filename: '[name].js'
    },
    resolve: {
        root: [path.join(__dirname, 'src')],
        extensions: ['', '.ts', '.tsx', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    }
};
