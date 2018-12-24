import { Controller, Route, Get, Post, Delete, Body } from '../../../src';

interface ITodo {
    id: number;
    name: string;
    done: boolean;
}

@Route('todo')
export class TodoController extends Controller {
    private _tasks: ITodo[] = [];
    private _id: number = 0;

    @Get()
    public search(term: string) {
        return this._tasks.filter(x => term === undefined || term.length === 0 || x.name.startsWith(term));
    }

    @Get('{id}')
    public get(id: number) {
        let found = this._tasks.filter(x => x.id === id);
        return found.length > 0 ? found[0] : null;
    }

    @Post('{id}/[action]')
    public done(id: number) {
        let found = this._tasks.filter(x => x.id === id);
        if (found.length > 0) {
            found[0].done = true;
            return found[0];
        }
        return null;
    }

    @Post()
    public save(id: number, @Body todo: ITodo) {
        let found = this._tasks.filter(x => x.id === id);
        if (found.length > 0) {
            found[0].done = todo.done;
            found[0].name = todo.name;
            return found[0];
        } else {
            todo.id = ++this._id;
            this._tasks.push(todo);
            return todo;
        }
    }

    @Delete('{id}')
    public remove(id: number) {
        let index = this._tasks.findIndex(x => x.id === id);
        if (index > -1) {
            this._tasks.splice(index, 1);
            return true;
        }
        return false;
    }
}