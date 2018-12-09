const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsConfig = require('./tsconfig.json');
const merge = require('merge2');
const tslint = require('gulp-tslint');

function lint(cb) {
    gulp.src('src/**/*.ts')
        .pipe(tslint({ configuration: 'tslint.json' }))
        .pipe(tslint.report());
    cb();
};

function compile(cb) {
    let tsResult = gulp.src('src/**/*.ts')
        .pipe(ts(tsConfig.compilerOptions));

    merge([ tsResult.dts.pipe(gulp.dest('dist')), tsResult.js.pipe(gulp.dest('dist')) ]);
    cb();
};

function copy(cb) {
    gulp.src('package.json')
        .pipe(gulp.dest('dist'));
    cb();
};

gulp.task('build', gulp.series(lint, gulp.parallel(compile, copy)));

gulp.task('watch', function(cb) {
    gulp.watch('src/**/*.ts', compile);
    cb();
});