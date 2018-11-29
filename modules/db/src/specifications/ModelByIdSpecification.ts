import { Model } from '../Model';
import { Specification } from './Specification';

export class ModelByIdSpecification<TModel extends Model> extends Specification<TModel> {
    constructor(id: number) {
        super(x => x.id === id, { id });
    }
}