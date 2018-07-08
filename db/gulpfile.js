const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsConfig = require('./src/tsconfig.json');
const testTsConfig = require('./tests/tsconfig.json');
const merge = require('merge2');
const mocha = require('gulp-mocha');
const through = require('through2');
const parse = require('./config/parse').parse;

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
        .pipe(through.obj(function(file, encoding, callback) {
            if (file.isNull()) {
                return callback(null, file);
            } else if (file.isStream()) {
                return callback(null, file);
            } else if (file.isBuffer()) {
                var result = parse(file.contents.toString());
                file.contents = Buffer.from(result, 'utf8');
                return callback(null, file);
            }
        }))
        .pipe(ts(testTsConfig.compilerOptions))
        .pipe(gulp.dest('dist_test'));
});

gulp.task('copy', function() {
    gulp.src('package.json')
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['compile'], function() {
    gulp.watch('src/**/*.ts', ['compile']);
});

gulp.task('test', function() {
    gulp.src('dist_test/**/*.spec.js', { read: false })
        .pipe(mocha({ reporter: 'spec' }));
});