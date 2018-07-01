const gulp = require('gulp');
const spawn = require('child_process').spawn;
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server/lib/Server');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const utils = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');
let node;
let server;

gulp.task('webpack.devserver', function() {
    const compiler = webpack(require('./webpack.config'));
    server = new WebpackDevServer(compiler, { proxy: { '*': 'http://localhost:8081' } });
    server.listen(8080, 'localhost');
});

gulp.task('watch', ['watch.server', 'webpack.devserver']);


//#region Server Configuration
const serverFiles = ['src/**/*.ts', '!src/client.ts', '!src/**/*.client.ts'];

// Build out the server and set up debugging for the server
gulp.task('server', function() {
    if (node) node.kill();
    node = spawn('node', ['--inspect', 'server.js'], { cwd: 'dist' });
    node.on('message', (message) => {
        console.log(message);
    });
    node.on('close', function(code) {
        if (code === 8) {
            utils.log('Error detected, waiting for changes...');
        }
    });
});

// Watch the server and build out and re-create the server on changes
gulp.task('watch.server', ['build.server'], function() {
    gulp.start('server');
    gulp.watch(serverFiles, ['build.server'], () => {
        gulp.start('server');
    });
});

// Lint the server before building it.
gulp.task('lint.server', function() {
    gulp.src(serverFiles)
        .pipe(tslint({ formatter: 'verbose' }))
        .pipe(tslint.report());
})

// Build the server and setup the source maps for debugging
gulp.task('build.server', ['lint.server'], function() {
    return gulp.src(serverFiles)
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});
//#endregion

process.on('exit', function() {
    if (node) node.kill();
    if (server) server.close();
});