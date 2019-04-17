import { Field } from '../../src';

export class Address {
    @Field()
    public line1: string = '';

    @Field()
    public city: string = '';

    @Field()
    public state: string = '';

    @Field()
    public zip: string = '';
}
