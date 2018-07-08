import { FindOptions } from 'sequelize';
import { Spec, ModelByIdSpec } from './specs';
import { Model, ModelClass, DecoratedModelClass } from './Model';
import { Connection } from './Connection';

export abstract class Service<TModel extends Model> {
    protected abstract _model: ModelClass<TModel>;

    private get Model() { return this._connection.model<TModel>((<any>this._model).__table_name__); }

    public constructor(private _connection: Connection) {
    }

    public async findAll(spec?: Spec<TModel>) {
        let options: FindOptions<TModel> = {};
        if (spec !== undefined) options.where = spec.parse();
        return await this.Model.findAll(options);
    }

    public async findOne(spec?: Spec<TModel>) {
        let options: FindOptions<TModel> = {};
        if (spec !== undefined) options.where = spec.parse();
        return await this.Model.findOne(options);
    }

    public async save(...models: TModel[]) {
        let savedModels: TModel[] = [];
        for (let i = 0; i < models.length; ++i) {
            let model = await this.findOne(new ModelByIdSpec<TModel>(models[i].id));
            if (model === null) {
                savedModels.push(await this.Model.create(models[i]));
            } else {
                model = this.mapColumns(model, models[i]);
                savedModels.push(await (<any>model).save());
            }
        }
        return savedModels;
    }

    public async destroy(...models: TModel[]) {
        for (let i = 0; i < models.length; ++i) {
            let model = await this.findOne(new ModelByIdSpec<TModel>(models[i].id));
            if (model !== null) {
                await (<any>model).destroy();
            }
        }
        return true;
    }

    private mapColumns(to: TModel, from: TModel) {
        let keys = Object.keys((<any>this._model).__columns__);
        for (let i = 0; i < keys.length; ++i) {
            to[keys[i]] = from[keys[i]];
        }
        return to;
    }
}