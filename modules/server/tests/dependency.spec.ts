import { assert } from 'chai';
import 'mocha';
import { Dependency, Route } from '../src';

class Animal {
    constructor(public legs: number, public arms: number) { }
}

class Tiger extends Animal {
    constructor() {
        super(4, 0);
    }
}

class Kangaroo extends Animal {
    constructor() {
        super(2, 2);
    }
}

@Route('Zoo')
class Zoo {
    constructor(public t: Tiger, public k: Kangaroo, public a: Animal) {
    }
}

describe('{Dependency}', function() {
    it('Basic', (done) => {
        let dependency = new Dependency();
        dependency.addSingle(new Animal(7, 7));
        dependency.addSingle(new Tiger());
        dependency.addSingle(new Kangaroo());

        let zoo = dependency.resolve(Zoo);
        assert.equal(zoo.t.legs, 4);
        assert.equal(zoo.t.arms, 0);
        assert.equal(zoo.k.legs, 2);
        assert.equal(zoo.k.legs, 2);
        assert.equal(zoo.a.legs, 7);
        assert.equal(zoo.a.legs, 7);
        done();
    });
});