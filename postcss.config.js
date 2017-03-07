const config = {
    plugins: [
        require('postcss-import')(),
        require('postcss-nesting')(),
        require('postcss-custom-media')(),
        require('postcss-cssnext')({
            "browsers": "last 2 versions",
            "warnForDuplicates": false,
        })
    ]
}

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(require('postcss-csso')());
}

module.exports = config;
