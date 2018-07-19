import { Specification } from '../../src';
import { Person } from '../models/person.model';

export class PersonByFirstNameSpec extends Specification<Person> {
    public constructor(firstName: string) {
        super(x =>
            x.FirstName === firstName
            && (x.LastName === 'Joe' || x.Birthday === new Date())
            && x.Addresses.findIndex(y => y.City === 'Test') > -1
            , { firstName });
    }
}