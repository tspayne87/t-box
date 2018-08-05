import 'reflect-metadata';
import { SequelizeRepository } from '../src';
import { Person } from './models/person.model';
import { Address } from './models/address.model';
import { connectionOptions } from './utils';

const conn = new SequelizeRepository({
    dialect: 'sqlite'
});
conn.addModel(Address);
conn.addModel(Person);

async function test() {
    await conn.initialize();
}

test()
    .then(() => process.exit())
    .catch(err => {
        console.log(err);
        process.exit();
    });