import { assert } from 'chai';
import 'mocha';

import '../src/adaptors/mongoose/adaptor';
import { Specification } from '../src';

import { IPerson } from './interfaces';

describe('Mongoose - Tests', function() {
    it('Single Query', () => {
        let boolSpec = new Specification<IPerson>(x => x.isDeleted === false);
        assert.deepEqual(boolSpec.query(), { isDeleted: false });

        let isDeletedSpec = new Specification<IPerson>(x => x.isDeleted);
        assert.deepEqual(isDeletedSpec.query(), { isDeleted: true });

        let isNotDeletedSpec = new Specification<IPerson>(x => !x.isDeleted);
        assert.deepEqual(isNotDeletedSpec.query(), { isDeleted: { $not: true } });

        let stringSpec = new Specification<IPerson>(x => x.firstName === 'John');
        assert.deepEqual(stringSpec.query(), { firstName: 'John' });

        let numberSpec = new Specification<IPerson>(x => x.age === 10);
        assert.deepEqual(numberSpec.query(), { age: 10 });

        let lessThanSpec = new Specification<IPerson>(x => x.age < 10);
        assert.deepEqual(lessThanSpec.query(), { age: { $lt: 10 } });

        let lessThanOrEqualSpec = new Specification<IPerson>(x => x.age <= 10);
        assert.deepEqual(lessThanOrEqualSpec.query(), { age: { $lte: 10 } });

        let greaterThanSpec = new Specification<IPerson>(x => x.age > 10);
        assert.deepEqual(greaterThanSpec.query(), { age: { $gt: 10 } });

        let greaterThanOrEqualSpec = new Specification<IPerson>(x => x.age >= 10);
        assert.deepEqual(greaterThanOrEqualSpec.query(), { age: { $gte: 10 } });

        let d = new Date();
        let dateSpec = new Specification<IPerson>(x => x.birthday === d, { d });
        assert.deepEqual(dateSpec.query(), { birthday: d });
    });

    it('And Queries', () => {
        let basicAnd = new Specification<IPerson>(x => x.isDeleted && x.age > 20);
        assert.deepEqual(basicAnd.query(), { isDeleted: true, age: { $gt: 20 } });

        let allAnd = new Specification<IPerson>(x => x.isDeleted && x.firstName === 'John' && x.lastName === 'Doe' && x.age <= 40 && x.gender === 'M');
        assert.deepEqual(allAnd.query(), { isDeleted: true, firstName: 'John', lastName: 'Doe', age: { $lte: 40 }, gender: 'M' });

        let complexAnd = new Specification<IPerson>(x => x.isDeleted && (x.firstName === 'John' && x.lastName === 'Doe' && (x.age <= 40 && x.gender === 'M')));
        assert.deepEqual(complexAnd.query(), { isDeleted: true, firstName: 'John', lastName: 'Doe', age: { $lte: 40 }, gender: 'M' });
    });

    it('Or Queries', () => {
        let basicOr = new Specification<IPerson>(x => x.isDeleted || x.age > 20);
        assert.deepEqual(basicOr.query(), { $or: [ { isDeleted: true }, { age: { $gt: 20 } } ] });

        let allOr = new Specification<IPerson>(x => x.isDeleted || x.firstName === 'John' || x.lastName === 'Doe' || x.age <= 40 || x.gender === 'M');
        assert.deepEqual(allOr.query(), { $or: [ { isDeleted: true }, { firstName: 'John' }, { lastName: 'Doe' }, { age: { $lte: 40 } }, { gender: 'M' } ] });

        let complexOr = new Specification<IPerson>(x => x.isDeleted || (x.firstName === 'John' || x.lastName === 'Doe' || (x.age <= 40 || x.gender === 'M')));
        assert.deepEqual(complexOr.query(), { $or: [ { isDeleted: true }, { firstName: 'John' }, { lastName: 'Doe' }, { age: { $lte: 40 } }, { gender: 'M' } ] });

        let inOr = new Specification<IPerson>(x => x.firstName === 'Jon' || x.firstName === 'John' || x.firstName === 'Jo');
        assert.deepEqual(inOr.query(), { firstName: { '$in': [ 'Jon', 'John', 'Jo' ] } });

        let complexInOr = new Specification<IPerson>(x => x.firstName === 'Jon' || x.firstName === 'John' || x.firstName === 'Jo' || x.lastName === 'Doe');
        assert.deepEqual(complexInOr.query(), { $or: [ { lastName: 'Doe' }, { firstName: { '$in': [ 'Jon', 'John', 'Jo' ] } } ] });
    });

    it('Complex Queries', () => {
        let betweenOr = new Specification<IPerson>(x => x.age <= 10 || x.age >= 50);
        assert.deepEqual(betweenOr.query(), { $or: [ { age: { $lte: 10 } }, { age: { $gte: 50 } } ] });

        let betweenAnd = new Specification<IPerson>(x => x.age > 10 && x.age < 50);
        assert.deepEqual(betweenAnd.query(), { age: { $gt: 10, $lt: 50 } });

        let andOr = new Specification<IPerson>(x => x.isDeleted && x.firstName === 'John' && (x.age > 10 || x.age < 20));
        assert.deepEqual(andOr.query(), { $and: [ { isDeleted: true }, { firstName: 'John' }, { $or: [ { age: { $gt: 10 } }, { age: { $lt: 20 } } ] } ] });

        let orAnd = new Specification<IPerson>(x => x.isDeleted || x.firstName === 'John' || (x.age <= 10 && x.age >= 50));
        assert.deepEqual(orAnd.query(), { $or: [ { isDeleted: true }, { firstName: 'John' }, { age: { $lte: 10, $gte: 50 } } ] });

        let d = new Date();
        let complex = new Specification<IPerson>(x => x.isDeleted && x.age > 2 && (x.address.city === 'Aurora' || x.birthday <= d || (x.gender === 'F' || x.lastName === 'Do')) && (x.gender === 'M' && x.lastName === 'Doe'), { d });
        assert.deepEqual(complex.query(), { $and: [ { isDeleted: true }, { age: { $gt: 2 } }, { $or: [ { 'address.city': 'Aurora' }, { birthday: { $lte: d } }, { gender: 'F' }, { lastName: 'Do' } ] }, { gender: 'M', lastName: 'Doe' } ] });
    });

    it('Exception Query', () => {
        let wrong = new Specification<IPerson>(x => x.isDeleted || x.age > 2 && x.address.city === 'Aurora');
        assert.throws(wrong.query.bind(wrong), 'Please wrap logical operations that are not the same with parentheses');

        let d = new Date();
        let noValue = new Specification<IPerson>(x => x.birthday === d);
        assert.throws(noValue.query.bind(noValue), 'Variables need to be passed in if you want to use the variable feature');

        let wrongValue = new Specification<IPerson>(x => x.birthday === d, { date: d });
        assert.throw(wrongValue.query.bind(wrongValue), 'Variable could not be found for use in the spec');
    });
});