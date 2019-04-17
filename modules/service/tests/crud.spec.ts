import { assert } from 'chai';
import 'mocha';

import { User, Address } from './models';
import { UserService } from './services';
import { ServerRepository } from '../src/server';
import { testUser } from './customModels';

describe('{CRUD}', function() {
    let repository: ServerRepository;

    before(function (done) {
        repository = new ServerRepository();
        repository.connect('mongodb://localhost:27017/tboxModelTest')
            .then(() => {
                repository.addModel(User);
                done();
            }).catch((err) => done(err));
    });

    it('Create', (done) => {
        let service = new UserService(repository);
        service.save(testUser)
            .then(() => done())
            .catch(err => done(err));
    });

    it('FindOne', (done) => {
        let service = new UserService(repository);
        service.find()
            .first()
            .then(result => {
                assert.notEqual(result, null);
                assert.equal(result instanceof User, true);

                if (result !== null) {
                    assert.equal(testUser.username, result.username);

                    assert.equal(result.addresses[0] instanceof Address, true);

                    assert.equal(testUser.addresses[0].line1, result.addresses[0].line1);
                    assert.equal(testUser.addresses[0].city, result.addresses[0].city);
                    assert.equal(testUser.addresses[0].state, result.addresses[0].state);
                    assert.equal(testUser.addresses[0].zip, result.addresses[0].zip);
                }
                done();
            }).catch(err => done(err));
    });

    it('Find', (done) => {
        let service = new UserService(repository);
        service.find()
            .toArray()
            .then(results => {
                assert.notEqual(results.length, 1);

                let result = results[0];
                assert.equal(result instanceof User, true);

                assert.equal(testUser.username, result.username);

                assert.equal(result.addresses.length, 1);
                assert.equal(result.addresses[0] instanceof Address, true);

                assert.equal(testUser.addresses[0].line1, result.addresses[0].line1);
                assert.equal(testUser.addresses[0].city, result.addresses[0].city);
                assert.equal(testUser.addresses[0].state, result.addresses[0].state);
                assert.equal(testUser.addresses[0].zip, result.addresses[0].zip);
                done();
            }).catch(err => done(err));
    });

    it('Remove', (done) => {
        let service = new UserService(repository);
        service.find()
            .first()
            .then(result => {
                assert.notEqual(result, null);
                if (result !== null) {
                    service.remove(result)
                        .then(r => {
                            assert.equal(r, true);
                            done();
                        }).catch(err => done(err));
                } else {
                    done();
                }
            }).catch(err => done(err));
    });

    after(function(done) {
        repository.disconnect()
            .then(x => done())
            .catch(err => done(err));
    });
});
