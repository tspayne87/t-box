import { Result } from '../results';

export interface IActionCtor {
    new (...args: any[]): IAction;
}

export interface IAction {
    processAction(): Result | Promise<Result | undefined> | undefined;
}