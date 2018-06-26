import { assert } from 'chai';
import 'mocha';
import { Server } from '../src';
import { UserController } from './controllers/user.controller';
import { UserInjection } from './injectors/user.injector';
import { Http } from './utils';

describe('{Injection}:/user', function() {
    let id = '4543-38483-29983-2093';
    let port = 8000;

    let http = new Http();
    let server = new Server();
    server.addControllers(new UserController());
    server.addInjectors(new UserInjection());

    before(function () {
        server.listen(port);
    });

    it('{GET}:/user/{id}', (done) => {
        http.Get(`http://localhost:${port}/user/${id}`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal(`${id}-Injection`, data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{POST}:/user', (done) => {
        http.Post(`http://localhost:${port}/user`, { id })
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.deepEqual({ id, injection: true }, data);
                done();
            })
            .catch((err) => done(err));
    });

    it('{DELETE}:/user/{id}', (done) => {
        http.Delete(`http://localhost:${port}/user/${id}`)
            .then((data) => {
                assert.equal(http.status, 200);
                assert.equal(http.headers['content-type'], 'application/json');
                assert.equal(false, data);
                done();
            })
            .catch((err) => done(err));
    });

    after(function() {
        server.close();
    });
});