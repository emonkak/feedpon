const config = {
    plugins: [
        require('postcss-import')(),
        require('postcss-simple-vars')(),
        require('postcss-calc')(),
        require('postcss-custom-media')(),
        require('postcss-color-function')(),
        require('autoprefixer')({
            browsers: [
                'last 1 chrome version',
                'last 1 firefox version',
                'last 1 ios version',
                'last 1 android version'
            ]
        })
    ]
}

module.exports = config;
