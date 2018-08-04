import 'reflect-metadata';
import { FIELDTYPE, FIELDOPTIONS, IFieldOptions, ENTITY } from './declarations';
import { Repository } from './Repository';
import { Field } from './decorators';

export class Model {
    constructor(private _repo: Repository) {
    }

    @Field({ isPrimary: true, autoIncrement: true })
    public id!: number;

    public static getFieldType(property: string): Function | Function[] {
        let obj = new (<any>this)();
        let designType = Reflect.getMetadata('design:type', obj, property);
        let type = Reflect.getMetadata(FIELDTYPE, obj, property);
        if (designType === Array) {
            type = [ type ];
        }
        return type === undefined ? designType : type;
    }

    public static getFieldOptions(property: string): IFieldOptions | undefined {
        return Reflect.getMetadata(FIELDOPTIONS, new (<any>this)(), property);
    }

    public static get entityName(): string {
        return Reflect.getMetadata(ENTITY, this);
    }
}

export interface IModel<T extends Model> {
    new (_repo: Repository, ...args: any[]): T;
    entityName: string;
    getFieldType(property: string): Function | Function[];
    getFieldOptions(property: string): IFieldOptions | undefined;
}