import 'reflect-metadata';

interface IDependency {
    new (...args: any[]): any;
}

export class Dependency {
    private _injectables: any[] = [];

    public addSingle(injectable: any) {
        this._injectables.push(injectable);
    }

    public addDependency(dependency: IDependency) {
        this._injectables.push(this.locate(dependency));
    }

    public locate(item: IDependency) {
        let args = this.getDependencyInjections(item);
        return new item(...args);
    }

    private getDependencyInjections(item: IDependency): any[] {
        let args: any[] = [];
        let params = Reflect.getMetadata('design:paramtypes', item);
        if (params !== undefined) {
            for (let i = 0; i < params.length; ++i) {
                let instanceIndex = this._injectables.findIndex(x => x instanceof params[i]);
                if (instanceIndex > -1) {
                    args.push(this._injectables[instanceIndex]);
                } else {
                    args.push(null);
                }
            }
        }
        return args;
    }
}