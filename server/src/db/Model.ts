import 'reflect-metadata';
import { FIELDTYPE, FIELDOPTIONS, IFieldOptions, ENTITY } from './declarations';
import { Repository } from './Repository';
import { Field } from './decorators';
import { Query } from './Query';

export class Model {
    constructor(private _repository: Repository) {
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

    public async save() {
        return (await this._repository.save((<any>this).constructor, this))[0];
    }

    public async destroy() {
        return await this._repository.destroy((<any>this).constructor, this);
    }
}

export interface IModel<T extends Model> {
    new (_repo: Repository, ...args: any[]): T;
    entityName: string;
    getFieldType(property: string): Function | Function[];
    getFieldOptions(property: string): IFieldOptions | undefined;
}