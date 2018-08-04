import 'reflect-metadata';
import { FIELDTYPE, FIELDOPTIONS, IFieldOptions, ENTITY } from './declarations';
import { Field } from './decorators';

export class Model {

    @Field({ isPrimary: true, autoIncrement: true })
    public id!: number;

    public static getFieldType(property: string): Function | Function[] {
        let obj = new this();
        let designType = Reflect.getMetadata('design:type', obj, property);
        let type = Reflect.getMetadata(FIELDTYPE, obj, property);
        if (designType === Array) {
            type = [ type ];
        }
        return type === undefined ? designType : type;
    }

    public static getFieldOptions(property: string): IFieldOptions | undefined {
        return Reflect.getMetadata(FIELDOPTIONS, new this(), property);
    }

    public static get entityName(): string {
        return Reflect.getMetadata(ENTITY, this);
    }
}

export interface IModel<T extends Model> {
    new (...args: any[]): T;
    entityName: string;
    getFieldType(property: string): Function | Function[];
    getFieldOptions(property: string): IFieldOptions | undefined;
}