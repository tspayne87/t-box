import 'reflect-metadata';
import { addModelProperty } from '../util';
import { FIELDTYPE, FIELDOPTIONS, IFieldOptions } from '../declarations';

export function Field();
export function Field(options: IFieldOptions);
export function Field(arrayType: Function, options?: IFieldOptions);
export function Field(arrayType?: any, options?: IFieldOptions) {
    let opts: IFieldOptions = options || {};
    if (arrayType !== undefined && typeof arrayType !== 'function') {
        opts = arrayType;
    }
    return (target: any, property: string) => {
        addModelProperty(target, property);
        Reflect.defineMetadata(FIELDOPTIONS, opts, target, property);
        if (arrayType !== undefined && typeof arrayType === 'function') {
            Reflect.defineMetadata(FIELDTYPE, arrayType, target, property);
        }
    };
}