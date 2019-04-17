import { schemaMetaKey, fieldMetaKey, IFieldMetadata } from '../decorators';

export class ModelHelper {
    public static CreatePathModel(model: any, path: string = '') {
        let fields: IFieldMetadata[] | undefined = Reflect.getOwnMetadata(fieldMetaKey, model);
        if (fields === undefined) return path;

        let obj: any = { };
        for (let i = 0; i < fields.length; ++i) {
            let key = fields[i].key;
            let fieldPath = path.length > 0 ? `${path}.${key}` : key;

            if (fields[i].isArray) {
                obj[key] = [ this.CreatePathModel(fields[i].type, fieldPath), fieldPath ];
            } else {
                obj[key] = this.CreatePathModel(fields[i].type, fieldPath);
                if (typeof obj[key] !== 'string') {
                    obj[key].__fieldPath = fieldPath;
                }
            }
        }
        return obj;
    }

    public static MapModel(model: any, data: any) {
        if (data === null) return null;

        let fields: IFieldMetadata[] = Reflect.getOwnMetadata(fieldMetaKey, model);
        if (Array.isArray(data)) {
            let models: any[] = [];
            for (let i = 0; i < data.length; ++i) {
                models.push(this.mapModelItem(fields, model, data[i]));
            }
            return models;
        } else {
            return this.mapModelItem(fields, model, data);
        }
    }

    private static mapModelItem(fields: IFieldMetadata[], modelClass: any, data: any) {
        let model = new modelClass();
        let schemaName = Reflect.getOwnMetadata(schemaMetaKey, modelClass);
        if (schemaName !== undefined && data._id !== undefined) {
            model._id = data._id.toString();
        }

        for (let i = 0; i < fields.length; ++i) {
            let key = fields[i].key;
            if (typeof data[key] === 'object') {
                model[key] = this.MapModel(fields[i].type, data[key]);
            } else if (typeof data[key] !== 'function') {
                model[key] = data[key];
            }
        }
        return model;
    }
}
