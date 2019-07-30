import { Dependency } from '../dependency';

export interface IServiceHandler {
    addServices(dependency: Dependency): void | Promise<void>;
}