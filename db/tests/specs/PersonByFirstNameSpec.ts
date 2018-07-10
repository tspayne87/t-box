import { Specification } from '../../src';
import { Person } from '../models/person.model';

export class PersonByFirstNameSpec extends Specification<Person> {
    public constructor(firstName: string) {
        super(x => x.FirstName == firstName, { firstName });
    }
}