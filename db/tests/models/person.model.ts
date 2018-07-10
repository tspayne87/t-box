import { Address } from './address.model';
import { Table, Column, Model, HasMany } from '../../src';

@Table('person')
export class Person extends Model {

    @Column()
    public FirstName!: string;

    @Column()
    public LastName!: string;

    @Column()
    public Birthday!: Date;

    @HasMany(Address)
    public Addresses!: Address[];
}