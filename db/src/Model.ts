import * as Sequelize from 'sequelize';
import { Column } from './decorators';

export class Model {
    public id: number = -1;
}

export type ModelClass<C> = { new (...args: any[]): C & Model } & typeof Model;
export type DecoratedModelClass = ModelClass<Model> & {
    __columns__: { [key: string]: Sequelize.DefineAttributeColumnOptions };
    __table_name__: string;
}