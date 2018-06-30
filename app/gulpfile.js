const gulp = require('gulp');
const spawn = require('child_process').spawn;
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const utils = require('gulp-util');
const through = require('through2');
let node;

gulp.task('server', function() {
    if (node) node.kill();
    node = spawn('node', ['dist/server.js'], { stdio: 'inherit' });
    node.on('message', (message) => {
        console.log(message);
    });
    node.on('close', function(code) {
        if (code === 8) {
            utils.log('Error detected, waiting for changes...');
        }
    });
});

gulp.task('watch', ['watch.server']);

gulp.task('watch.server', function() {
    return gulp.src('./src/server.ts')
        .pipe(webpackStream({
            watch: true,
            config: require('./webpack.config.server')
        }, webpack, (err, stats) => {
            utils.log(stats.toString('minimal'));
            gulp.start('server');
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('build.server', function() {
    return gulp.src('./src/server.ts')
        .pipe(webpackStream(require('./webpack.config.server'), webpack))
        .pipe(gulp.dest('dist'));
});

process.on('exit', function() {
    if (node) node.kill();
});