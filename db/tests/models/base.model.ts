import { Table, Column, Model } from '../../src';

export class BaseModel extends Model {

    @Column()
    public TestField!: string;
}