import { Field, Schema, Model } from '../../src';
import { Address } from './address';

@Schema('user')
export class User extends Model {
    @Field()
    public username: string = '';

    @Field(Address)
    public addresses: Address[] = [];
}
