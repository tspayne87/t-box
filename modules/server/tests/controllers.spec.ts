import { assert } from 'chai';
import 'mocha';
import { InternalServer } from '../src/internal';
import { Dependency } from '../src/Dependency';
import { UserController } from './controllers/user.controller';
import { Http } from './utils';
import * as fs from 'fs';
import * as path from 'path';

describe('{Controller}:/user', function() {
    let id = '4543-38483-29983-2093';
    let port = 8000;

    let http = new Http();
    let server = new InternalServer(new Dependency(), __dirname);
    server.addControllers(UserController);

    before(function () {
        server.listen(port);
    });

    it('{GET}:/user', (done) => {
        http.Get(`http://localhost:${port}/user`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal('Searching...', data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{GET}:/user/{id}', (done) => {
        http.Get(`http://localhost:${port}/user/${id}`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal(id, data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{GET}:/user/index', (done) => {
        http.Get(`http://localhost:${port}/user/index`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'text/html');
                assert.equal('<html><head></head><body><div id="app"></div></body><html>', data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{POST}:/user', (done) => {
        http.Post(`http://localhost:${port}/user`, { id })
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.deepEqual({ id }, data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{DELETE}:/user/{id}', (done) => {
        http.Delete(`http://localhost:${port}/user/${id}`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal(true, data);
                done();
            })
            .catch((err) => done(err));
    });

    it('File Upload', (done) => {
        http.File(`http://localhost:${port}/user/upload`, __dirname + '/test-file.txt', 'test.txt')
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal(true, data);

                // Remove the file that was uploaded to the server and test if it is the same contents.
                let filePath = path.join(__dirname, 'uploads', 'user_upload.txt');
                let comparePath = path.join(__dirname, 'test-file.txt');
                fs.readFile(filePath, 'utf8', (err, contents) => {
                    if (err) return done(err);
                    fs.readFile(comparePath, 'utf8', (err, compareContents) => {
                        if (err) return done(err);
                        assert.equal(contents, compareContents);
                        fs.unlink(filePath, (err) => {
                            if (err) return done(err);
                            done();
                        });
                    });
                });
            })
            .catch((err) => done(err));
    });

    it('Image Upload', (done) => {
        http.File(`http://localhost:${port}/user/upload`, __dirname + '/tux.png', 'test.png')
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal(true, data);

                // Remove the file that was uploaded to the server and test if it is the same contents.
                let filePath = path.join(__dirname, 'uploads', 'user_upload.png');
                let comparePath = path.join(__dirname, 'tux.png');
                fs.readFile(filePath, (err, contents) => {
                    if (err) return done(err);
                    fs.readFile(comparePath, (err, compareContents) => {
                        if (err) return done(err);
                        assert.equal(contents.length, compareContents.length);
                        for (let i = 0; i < compareContents.length; ++i) {
                            assert.equal(contents[i], compareContents[i]);
                        }
                        fs.unlink(filePath, (err) => {
                            if (err) return done(err);
                            done();
                        });
                    });
                });
            })
            .catch((err) => done(err));
    });

    after(function() {
        server.close();
    });
});