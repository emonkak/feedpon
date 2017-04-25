const config = {
    plugins: [
        require('postcss-import')(),
        require('postcss-nesting')(),
        require('postcss-simple-vars')(),
        require('postcss-custom-media')(),
        require('postcss-color-function')(),
        require('autoprefixer')({
            browsers: 'last 2 versions'
        })
    ]
}

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(require('postcss-csso')());
}

module.exports = config;
