import { INTEGER } from 'sequelize';
import { Table, Column, Model } from '../../src';

@Table('address')
export class Address extends Model {

    @Column()
    public Line1!: string;

    @Column()
    public Line2!: string;

    @Column()
    public City!: string;

    @Column()
    public State!: string;

    @Column()
    public Zip!: string;
    
    public personId!: number;
}