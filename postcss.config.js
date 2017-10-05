const config = {
    plugins: [
        require('postcss-import')(),
        require('postcss-simple-vars')(),
        require('postcss-custom-media')(),
        require('postcss-color-function')(),
        require('autoprefixer')({
            browsers: 'last 1 version'
        })
    ]
}

module.exports = config;
