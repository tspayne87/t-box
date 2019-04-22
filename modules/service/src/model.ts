
export class Model {
    public _id?: string;
}

export interface IModel {
    new (...args: any[]): Model;
}
