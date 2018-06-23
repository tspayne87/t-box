const gulp = require('gulp');
const ts = require('gulp-typescript');
const mocha = require('gulp-mocha');

gulp.task('build', function () {
    var project = ts.createProject('tsconfig.json');
    var tsResult = gulp.src(['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.controller.ts'])
        .pipe(project());

    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('test', function () {
    var project = ts.createProject('tsconfig.json');
    var tsResult = gulp.src('src/**/*.ts')
        .pipe(project());

    tsResult.js
        .pipe(gulp.dest('tests'));


    gulp.src('tests/**/*.spec.js')
        .pipe(mocha())
        .once('err', err => {
            console.error(err);
            process.exit(1);
        })
        .once('end', () => {
            process.exit();
        });
});