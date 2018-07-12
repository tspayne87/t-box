import * as Sequelize from 'sequelize';
import { Column } from './decorators';

export interface IModel {
    new (...args: any[]): Model;
    __table_name__: string;
}

export class Model {

    @Column({ type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true })
    public id!: number;
}