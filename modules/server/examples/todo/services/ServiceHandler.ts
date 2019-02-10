import { IServiceHandler, Dependency } from '../../../src';
import { TodoService } from './TodoService';

export class ServiceHandler implements IServiceHandler {
    public addServices(dependency: Dependency): void {
        dependency.addDependency(TodoService);
    }
}