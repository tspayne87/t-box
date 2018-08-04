import { Address } from './address.model';
import { Entity, Field, Model } from '../../src';

export enum PersonGender { Male = 'Male', Female = 'Female' }

@Entity('person')
export class Person extends Model {

    @Field()
    public FirstName!: string;

    @Field()
    public LastName!: string;

    @Field()
    public Birthday!: Date;

    @Field()
    public Gender!: PersonGender;

    @Field(Address)
    public Addresses!: Address[];
}