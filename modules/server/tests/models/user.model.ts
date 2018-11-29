import { Entity, Field, Model } from '../../src';

@Entity('user')
export class User extends Model {

    @Field()
    public Username!: string;

    @Field()
    public Password!: string;
}