import 'reflect-metadata';
import * as Sequelize from 'sequelize';
import { ModelClass, Model } from '../Model';
import { addModelProperty } from '../util';

export const HASMANY: string = 'so:db:has:many';

export function HasMany<TModel extends Model>(model: ModelClass<TModel>, options?: Sequelize.AssociationOptionsHasMany) {
    let hasManyOptions: Sequelize.AssociationOptionsHasMany = options || { };
    return (target: any, property: string) => {
        addModelProperty(target, property);
        hasManyOptions.as = property;
        Reflect.defineMetadata(HASMANY, { table: (<any>model).__table_name__, options: hasManyOptions }, target, property);
    };
}