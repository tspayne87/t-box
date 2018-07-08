import { Model } from '../Model';
import { Spec } from './Spec';

export class ModelByIdSpec<TModel extends Model> extends Spec<TModel> {
    constructor(id: number) {
        super(x => x.id == id, { id });
    }
}