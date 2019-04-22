import { Dependency } from '../Dependency';

export interface IServiceHandler {
    addServices(dependency: Dependency): void | Promise<void>;
}