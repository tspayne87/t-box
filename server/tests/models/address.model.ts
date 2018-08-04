import { Entity, Field, Model } from '../../src';

@Entity('address')
export class Address extends Model {

    @Field()
    public Line1!: string;

    @Field()
    public Line2!: string;

    @Field()
    public City!: string;

    @Field()
    public State!: string;

    @Field()
    public Zip!: string;
    
    public personId!: number;
}