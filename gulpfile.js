var gulp = require('gulp');
var gutil = require('gulp-util');

function compileJs(browserify) {
    var babelify = require('babelify');
    var buffer = require('vinyl-buffer');
    var source = require('vinyl-source-stream');

    var bundler = browserify({
            basedir: './build/modules/',
            entries: ['./app.js'],
            debug: true
        })
        .transform(babelify)
        .on('log', gutil.log)
        .on('update', bundle);

    function bundle() {
        bundler
            .bundle()
            .on('error', function(error) {
                gutil.log('Browserify error', gutil.colors.red(error.message));
            })
            .pipe(source('app.js'))
            .pipe(buffer())
            .pipe(gulp.dest('public/js/'));
    }

    return bundle();
}

gulp.task('typescript', function() {
    var typescript = require('gulp-typescript');

    var project = typescript.createProject({
        sortOutput: true,
        target: 'ES6',
        typescript: require('typescript')
    });

    return gulp.src('src/ts/**/*.ts')
        .pipe(typescript(project, {
            referencedFrom: ['app.ts']
        }))
        .pipe(gulp.dest('build/modules/'));
});

gulp.task('browserify', ['typescript'], function() {
    return compileJs(require('browserify'));
});

gulp.task('watchify', ['typescript'], function() {
    return compileJs(function(options) {
        return require('watchify')(require('browserify')(options));
    });
});

gulp.task('server', ['watch'], function () {
    var connect = require('connect');
    var serveStatic = require('serve-static');

    var app = connect();
    app.use(serveStatic('public'));
    app.listen(8888);
});

gulp.task('clean', function () {
    var del = require('del');

    del(['build', 'public']);
});

gulp.task('watch', ['watchify'], function() {
    gulp.watch(['src/ts/**/*.ts'], ['typescript']);
});

gulp.task('default', ['browserify']);
