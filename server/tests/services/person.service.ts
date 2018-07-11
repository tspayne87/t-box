import { Person } from '../models/person.model';
import { Service } from '../../src';

export class PersonService extends Service<Person> {
    protected _model = Person;
}