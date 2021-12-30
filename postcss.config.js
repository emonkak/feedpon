const TYPE_SCALE = 1.125;

function roundStep(num, step) {
    return Math.max(Math.floor(num / step) * step, 1.0);
}

const progress = require('postcss-progress');

module.exports = {
    map: false,
    plugins: [
        progress.start(),
        require('postcss-import')(),
        require('postcss-simple-vars')({
            variables: {
                'type-scale-1': Math.pow(TYPE_SCALE, 6),
                'type-scale-2': Math.pow(TYPE_SCALE, 5),
                'type-scale-3': Math.pow(TYPE_SCALE, 4),
                'type-scale-4': Math.pow(TYPE_SCALE, 3),
                'type-scale-5': Math.pow(TYPE_SCALE, 2),
                'type-scale-6': Math.pow(TYPE_SCALE, 1),
                'type-scale-7': Math.pow(TYPE_SCALE, -1),
                'type-scale-8': Math.pow(TYPE_SCALE, -2),
                'type-scale-9': Math.pow(TYPE_SCALE, -3),
                'type-height-1': roundStep(Math.pow(TYPE_SCALE, 6), 0.5),
                'type-height-2': roundStep(Math.pow(TYPE_SCALE, 5), 0.5),
                'type-height-3': roundStep(Math.pow(TYPE_SCALE, 4), 0.5),
                'type-height-4': roundStep(Math.pow(TYPE_SCALE, 3), 0.5),
                'type-height-5': roundStep(Math.pow(TYPE_SCALE, 2), 0.5),
                'type-height-6': roundStep(Math.pow(TYPE_SCALE, 1), 0.5),
                'type-height-7': roundStep(Math.pow(TYPE_SCALE, -1), 0.5),
                'type-height-8': roundStep(Math.pow(TYPE_SCALE, -2), 0.5),
                'type-height-9': roundStep(Math.pow(TYPE_SCALE, -3), 0.5)
            }
        }),
        require('postcss-calc')(),
        require('postcss-custom-media')(),
        require('postcss-color-mod-function')(),
        require('autoprefixer')(),
        progress.stop()
    ]
};
