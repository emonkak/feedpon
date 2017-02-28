module.exports = {
    plugins: [
        require('postcss-import')(),
        require('postcss-nesting')(),
        require('postcss-cssnext')({
            "browsers": "last 2 versions",
            "warnForDuplicates": false,
        })
    ]
};
