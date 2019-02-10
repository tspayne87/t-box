import { Controller, Route, Get, Post, Delete, Body } from '../../../src';
import { TodoService, ITodo } from '../services/TodoService';

@Route('todo')
export class TodoController extends Controller {
    public constructor(private _service: TodoService) {
        super();
    }

    @Get()
    public search(term: string) {
        return this._service.todos.filter(x => term === undefined || term.length === 0 || x.name.startsWith(term));
    }

    @Get('{id}')
    public get(id: number) {
        let found = this._service.todos.filter(x => x.id === id);
        return found.length > 0 ? found[0] : null;
    }

    @Post('{id}/[action]')
    public done(id: number) {
        let found = this._service.todos.filter(x => x.id === id);
        if (found.length > 0) {
            found[0].done = true;
            return found[0];
        }
        return null;
    }

    @Post()
    public save(id: number, @Body todo: ITodo) {
        let found = this._service.todos.filter(x => x.id === id);
        if (found.length > 0) {
            found[0].done = todo.done;
            found[0].name = todo.name;
            return found[0];
        } else {
            return this._service.add(todo);
        }
    }

    @Delete('{id}')
    public remove(id: number) {
        return this._service.remove(id);
    }
}