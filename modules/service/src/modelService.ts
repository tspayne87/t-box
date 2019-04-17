import 'reflect-metadata';
import { IRepository } from './repository';
import { schemaMetaKey, serviceMetaKey } from './decorators';
import { Model } from './model';
import { IQuery } from './query';

export class ModelService<T extends Model> {
    private _schemaName: string = '';
    protected _repository: IRepository;

    protected get schemaName(): string {
        if (this._schemaName.length === 0) {
            let model = Reflect.getMetadata(serviceMetaKey, (this as any).constructor);
            this._schemaName = Reflect.getMetadata(schemaMetaKey, model);
        }
        return this._schemaName;
    }

    public constructor(repository: IRepository) {
        this._repository = repository;
    }

    public find(): IQuery<T> {
        return this._repository.query<T>(this.schemaName);
    }

    public save(model: T): Promise<T> {
        return this._repository.save(this.schemaName, model);
    }

    public async remove(model: T): Promise<boolean> {
        return this._repository.remove(this.schemaName, model);
    }
}
