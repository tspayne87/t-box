import { Model, ModelClass, DecoratedModelClass } from '../Model';

function Table<C extends Model>(name: any): <CC extends ModelClass<C>>(target: CC) => CC
function Table<CC extends ModelClass<CC>>(name: any): CC
function Table(name: string): any {
    return (target: DecoratedModelClass): any => {
        target.__table_name__ = name;
        return target;
    }
}

export { Table };