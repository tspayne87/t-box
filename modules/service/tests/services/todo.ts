import { Service, ModelService } from '../../src';
import { Todo } from '../models';

@Service(Todo)
export class TodoService extends ModelService<Todo> {
}
