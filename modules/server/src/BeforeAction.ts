import { Result } from './results';

export interface IBeforeAction {
    new (...args: any[]): BeforeAction;
}

export abstract class BeforeAction {
    public abstract beforeRequest(): Result | Promise<Result | undefined> | undefined;
}