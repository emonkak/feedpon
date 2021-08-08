const progress = require('postcss-progress');

const config = {
    map: false,
    plugins: [
        progress.start(),
        require('postcss-import')(),
        require('postcss-simple-vars')(),
        require('postcss-calc')(),
        require('postcss-custom-media')(),
        require('postcss-color-mod-function')(),
        require('autoprefixer')(),
        progress.stop()
    ]
}

module.exports = config;
