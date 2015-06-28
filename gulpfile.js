/**
 * gulpfile.js
 * Build Automation
 *
 */

var path = require('path'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    webpack = require('webpack'),
    WebpackDevServer = require('webpack-dev-server'),
    WebpackDevConfig = require('./webpack.dev.config'),
    jest = require('gulp-jest'),
    eslint = require('gulp-eslint'),
    del = require('del'),
    babel = require('gulp-babel'),
    shell = require('gulp-shell'),
    uglify = require('gulp-uglify');

///////////
// CLEAN //
///////////

gulp.task('del', function(cb) {
    del([
        './build'
    ], function() {
        process.exit();
    });
});

//////////
// Test //
//////////

gulp.task('jest', function() {
    return gulp.src('./src/__tests__/*.js')
        .pipe(babel())
        .pipe(jest({
            scriptPreprocessor: __dirname + "/preprocessor.js",
            unmockedModulePathPatterns: [
                "node_modules/react"
            ]
        }));
});

//////////
// LINT //
//////////

gulp.task('lint', function() {
    return gulp.src(['src/js/**/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format());
});

////////////////
// Dev Build  //
////////////////

gulp.task("build-dev", function(callback) {

    new WebpackDevServer(webpack(WebpackDevConfig), {
        watch: true,
        hot: true,
        contentBase: path.resolve(__dirname, 'examples'),
        historyApiFallback: true
    }).listen(3002, 'localhost', function(err, result) {
        if (err) {
            console.log(err);
        }
        console.log('Examples dev server running at localhost:3002');
    });

});


//////////////////
// Distribution //
//////////////////


gulp.task('build', function(callback) {
    return gulp.src(['./src/index.js', '!./src/__tests__/*.js'])
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest('./build'));
});

/////////////////////
// Runnable Tasks  //
/////////////////////

gulp.task('default', ['build-dev']);

gulp.task('clean', ['del']);

gulp.task('test', ['lint', 'jest'], function() {
    process.exit();
});
