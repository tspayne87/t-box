const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsConfig = require('./tsconfig.json');
const merge = require('merge2');
const mocha = require('gulp-mocha');
const tslint = require('gulp-tslint');
const runSequence = require('run-sequence');

gulp.task('build', function() {
    runSequence('lint', ['compile', 'copy']);
});

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
    gulp.src('package.json')
        .pipe(gulp.dest('dist'));
});

gulp.task('lint', function() {
    gulp.src('src/**/*.ts')
        .pipe(tslint({ configuration: 'tslint.json' }))
        .pipe(tslint.report());
})

gulp.task('watch', ['compile'], function() {
    gulp.watch('src/**/*.ts', ['compile']);
});

gulp.task('test', function() {
    gulp.src('dist_test/**/*.spec.js', { read: false })
        .pipe(mocha({ reporter: 'spec' }));
});