import { assert } from 'chai';
import 'mocha';
import { Application } from '../src';
import { Http } from './utils';

describe('{Static}:/public', function() {
    let id = '4543-38483-29983-2093';
    let port = 8000;

    let http = new Http();
    let app = new Application({ cwd: __dirname, staticFolders: ['public'], assetDir: 'assets' });

    before(function (done) {
        app.listen(port);
        done();
    });

    it('{GET}:/public/test.css', (done) => {
        http.Get(`http://localhost:${port}/public/test.css`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'text/css');
                done();
            })
            .catch((err) => done(err));
    });

    it('{GET}:/public/test.js', (done) => {
        http.Get(`http://localhost:${port}/public/test.js`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/javascript');
                done();
            })
            .catch((err) => done(err));
    });

    it('{GET}:/public/test.png', (done) => {
        http.Get(`http://localhost:${port}/public/test.png`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'image/png');
                done();
            })
            .catch((err) => done(err));
    });

    it('{POST}:/public/test.svg', (done) => {
        http.Get(`http://localhost:${port}/public/test.svg`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'image/svg+xml');
                done();
            })
            .catch((err) => done(err));
    });

    it('{DELETE}:/public/test.woff', (done) => {
        http.Get(`http://localhost:${port}/public/test.woff`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'font/woff');
                done();
            })
            .catch((err) => done(err));
    });

    it('{GET}:/public/test.woff2', (done) => {
        http.Get(`http://localhost:${port}/public/test.woff2`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'font/woff2');
                done();
            })
            .catch((err) => done(err));
    });

    after(function(done) {
        app.close(done);
    });
});