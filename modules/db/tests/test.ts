import 'reflect-metadata';
import { MongooseRepository } from '../src';
import { Person } from './models/person.model';
import { Address } from './models/address.model';

const conn = new MongooseRepository('mongodb://localhost:27017/square-one-test');
conn.addModel(Address);
conn.addModel(Person);

async function test() {
    await conn.listen();

    let person = conn.model(Person);
    person.FirstName = 'Terry';
    person.LastName = 'Payne';
    await person.save();
    await conn.close();
}

test()
    .then(() => process.exit())
    .catch(err => {
        console.log(err);
        process.exit();
    });