import { assert } from 'chai';
import 'mocha';
import { InternalServer } from '../src/internal';
import { UserController } from './controllers/user.controller';
import { Http } from './utils';

describe('/user', function() {
    let id = '4543-38483-29983-2093';
    let port = 8000;

    let http = new Http();
    let server = new InternalServer();
    server.addControllers(new UserController());

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

    after(function() {
        server.close();
    });
});