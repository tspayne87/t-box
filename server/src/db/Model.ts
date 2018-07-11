import * as Sequelize from 'sequelize';
import { Column } from './decorators';

export class Model {

    @Column({ type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true })
    public id!: number;
}

export type ModelClass<C> = { new (...args: any[]): C & Model } & typeof Model;
export type DecoratedModelClass = ModelClass<Model> & {
    __table_name__: string;
};