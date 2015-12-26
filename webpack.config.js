var IgnorePlugin = require('webpack/lib/IgnorePlugin')
var path = require('path')

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
                test: /\.less$/,
                loaders: ['css-loader', 'less-loader']
            },
            {
                test: /\.ts$/,
                loaders: ['babel-loader', 'ts-loader']
            },
            {
                test: /\.js$/,
                exclude: path.resolve(__dirname, 'node_modules'),
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new IgnorePlugin(/^crypto$/)
    ]
}
