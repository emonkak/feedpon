var IgnorePlugin = require('webpack/lib/IgnorePlugin')

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
        extensions: ['', '.ts', '.js']
    },
    module: {
        loaders: [
            {
                test: require.resolve('ix/ix'),
                loader: "imports?define=>false"
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.ts$/,
                loaders: ['babel-loader', 'ts-loader']
            },
            {
                test: /\.js$/,
                exclude: /\/node_modules\//,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new IgnorePlugin(/^crypto$/)
    ]
}
