import { assert } from 'chai';
import 'mocha';

import { Specification } from '../src';
import '../src/adaptors/mongoose/adaptor';

import { IPerson, IPost } from './interfaces';

describe('Mongoose - Tests', function() {
    it('Basic Query', () => {
        let spec = new Specification<IPerson>(x => !x.isDeleted);
        let query = spec.query();
        console.log(JSON.stringify(query, null, 2));
    });
});