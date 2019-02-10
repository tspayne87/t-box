import { Injectable } from '../../../src';

export interface ITodo {
    id: number;
    name: string;
    done: boolean;
}

@Injectable
export class TodoService {
    private _id: number = 0;

    public todos: ITodo[] = [];

    public constructor() {
        for (let i = 0; i < 5; ++i) {
            this.add({ id: -1, name: 'TODO: ' + i, done: false });
        }
    }

    public add(todo: ITodo) {
        todo.id = ++this._id;
        this.todos.push(todo);
        return todo;
    }

    public remove(id: number) {
        let index = this.todos.findIndex(x => x.id === id);
        if (index > -1) {
            this.todos.splice(index, 1);
            return true;
        }
        return false;
    }
}