import { Table, Column } from '../../src';
import { BaseModel } from './base.model';

@Table('person')
export class Person extends BaseModel {

    @Column()
    public FirstName!: string;

    @Column()
    public LastName!: string;

    @Column()
    public Birthday!: Date;
}