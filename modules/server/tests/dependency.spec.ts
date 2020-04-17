import { assert } from 'chai';
import 'mocha';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { Dependency, Injectable } from '../src';
import { User, IUser, Role, IRole } from './schemas';

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

@Injectable
class Service {
    constructor(public userModel: Model<IUser>, public roleModel: Model<IRole>) { }
}


@Injectable
class Zoo {
    constructor(public t: Tiger, public k: Kangaroo, public a: Animal) {
    }
}

describe('{Dependency}', function() {
    before(function (done) {
        mongoose.connect('mongodb://localhost:27017/tboxTest', { useNewUrlParser: true, useUnifiedTopology: true })
            .then(x => done())
            .catch(err => done(err));
    });

    it('Basic', (done) => {
        let dependency = new Dependency();
        dependency.addSingle(new Animal(7, 7));
        dependency.addSingle(new Tiger());
        dependency.addSingle(new Kangaroo());

        let zoo = dependency.resolve<Zoo>(Zoo);
        assert.equal(zoo.t.legs, 4);
        assert.equal(zoo.t.arms, 0);
        assert.equal(zoo.k.legs, 2);
        assert.equal(zoo.k.legs, 2);
        assert.equal(zoo.a.legs, 7);
        assert.equal(zoo.a.legs, 7);
        done();
    });

    it('Mongoose Models', (done) => {
        let dependency = new Dependency();
        dependency.addSingle(mongoose.model<IUser>('users', User));
        dependency.addSingle(mongoose.model<IRole>('roles', Role));

        // TODO: Get this working somehow

        let service = dependency.resolve(Service);
        done();
    });

    after(function(done) {
        mongoose.disconnect()
            .then(x => done())
            .catch(err => done(err));
    });
});