import { Table, Column, Model, HasMany } from '../../src';

@Table('user')
export class User extends Model {

    @Column()
    public Username!: string;

    @Column()
    public Password!: string;
}