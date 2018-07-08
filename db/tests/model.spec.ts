import 'reflect-metadata';
import { assert } from 'chai';
import 'mocha';

import { Connection, Spec } from '../src';
import { Person } from './models/person.model';
import { PersonService } from './services/person.service';
import { PersonByFirstNameSpec } from './specs/PersonByFirstNameSpec';

describe('Connection - Tests', function() {
    const conn = new Connection();
    conn.addModels(Person);

    const service = new PersonService(conn);
    before(function (done) {
        conn.listen({
            dialect: 'mssql',
            dialectModulePath: 'sequelize-msnodesqlv8',
            dialectOptions: {
                connectionString: 'Driver={SQL Server Native Client 11.0};Server=TETHYS;Database=TestApp;Trusted_Connection=yes;'
            }
        })
            .then(() => done())
            .catch(err => done(err));
    });

    it('Create Person', (done) => {
        let person = new Person();
        person.FirstName = 'John';
        person.LastName = 'Doe';
        person.Birthday = new Date(2000,1,1);
        person.TestField = 'Testing Data';

        service.save(person)
            .then(() => done())
            .catch(err => done(err));
    });

    it('Find by FirstName', (done) => {
        service.findOne(new PersonByFirstNameSpec('John'))
            .then(result => {
                assert.notEqual(result, null);
                if (result !== null) {
                    assert.equal(result.FirstName, 'John');
                    assert.equal(result.LastName, 'Doe');
                    assert.equal(new Date(result.Birthday).toString(), new Date(2000,1,1).toString());
                    assert.equal(result.TestField, 'Testing Data');
                }
                done();
            })
            .catch(err => done(err));
    });

    it('Destroy Person', (done) => {
        service.findOne(new PersonByFirstNameSpec('John'))
            .then(result => {
                if (result !== null) {
                    service.destroy(result)
                        .then(() => done())
                        .catch(err => done(err));
                } else {
                    done('Person not found');
                }
            })
            .catch(err => done(err));
    });

    after(function(done) {
        conn.close()
            .then(() => done())
            .catch(err => done(err));
    });
});