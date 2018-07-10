const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsConfig = require('./tsconfig.json');
const merge = require('merge2');
const mocha = require('gulp-mocha');

gulp.task('build', ['compile', 'copy']);

gulp.task('compile', function() {
    let tsResult = gulp.src('src/**/*.ts')
        .pipe(ts(tsConfig.compilerOptions));

    return merge([
        tsResult.dts.pipe(gulp.dest('dist')),
        tsResult.js.pipe(gulp.dest('dist'))
    ]);
});

gulp.task('compile.test', function() {
    let tsResult = gulp.src(['**/*.ts', '!node_modules/**/*.ts'])
        .pipe(ts(tsConfig.compilerOptions))
        .pipe(gulp.dest('dist_test'));
});

gulp.task('copy', function() {
    gulp.src(['package.json', 'src/gulp.js'])
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['compile'], function() {
    gulp.watch('src/**/*.ts', ['compile']);
});

gulp.task('test', function() {
    gulp.src('dist_test/**/*.spec.js', { read: false })
        .pipe(mocha({ reporter: 'spec' }));
});