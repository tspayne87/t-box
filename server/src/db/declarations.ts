export const MODELPROPERTIES: string = 'so:db:model:properties';
export const ENTITY: string = 'so:db:entity';
export const FIELDOPTIONS: string = 'so:db:field:options';
export const FIELDTYPE: string = 'so:db:field:type';

export interface IFieldOptions {
    isPrimary?: boolean;
    autoIncrement?: boolean;
}