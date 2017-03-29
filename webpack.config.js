const path = require('path');

const config = {
    entry: {
        'background': './src/background.ts',
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
                test: /\.js$/,
                include: [path.join(__dirname, 'node_modules', '@emonkak')],
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['env', { targets: 'last 1 version' }]
                            ],
                            plugins: [
                                'transform-runtime'
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['env', { targets: 'last 1 version' }]
                            ],
                            plugins: [
                                'transform-runtime'
                            ]
                        }
                    },
                    'ts-loader'
                ]
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
