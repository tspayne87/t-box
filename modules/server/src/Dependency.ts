import 'reflect-metadata';

/**
 * Dependency that requires the object to be a class or a newable function.
 */
interface IDependency {
    new (...args: any[]): any;
}

/**
 * Class is meant to handle some simple dependency injection for the controllers and to allow for
 * services and other objects to be passes easily to controllers.
 */
export class Dependency {
    /**
     * The injectable objects the we are storing as singletons.
     */
    private _injectables: any[] = [];
    /**
     * The list of dependencies that should be created when a scope is created.
     */
    private _scopedDependencies: IDependency[] = [];

    public constructor(...injectables) {
        this._injectables = injectables;
    }

    /**
     * Method is meant to add instances of the object instead of the class type.
     * 
     * @param injectable The instance of the object that needs to be included as an injectable.
     */
    public addSingle(injectable: any) {
        this._injectables.push(injectable);
    }

    /**
     * Method is meant to include a class type into the injectables but first resolve the class before
     * creating an instance of the class.
     * 
     * @param dependency The type of the class that needs to be included into the injectables.
     */
    public addDependency(dependency: IDependency) {
        this._injectables.push(this.resolve(dependency));
    }

    /**
     * Method is meant to include dependencies that should be used during a scope.
     * 
     * @param dependency The dependency that we need to create when a scope is started.
     */
    public addScoped(dependency: IDependency) {
        this._scopedDependencies.push(dependency);
    }

    /**
     * Method is meant to create a dependency set for scoped requests.
     * 
     * @param injectables The injectables that should be added to the scope as defaults.
     */
    public createScope(...injectables: any[]): Dependency {
        let scope = new Dependency(...[ ...this._injectables, ...injectables ]);
        for (let i = 0; i < this._scopedDependencies.length; ++i) {
            scope.addDependency(this._scopedDependencies[i]);
        }
        return scope;
    }

    /**
     * Method is meant to resolve the class and create an instance.
     * 
     * @param item The item that needs to be resolved and the instance created, with the arguments injected into it.
     */
    public resolve(dependency: IDependency): any {
        let args = this.getDependencyInjections(dependency);
        return new dependency(...args);
    }

    /**
     * Helper method to get the arguments for a class to be built with.
     * 
     * @param item The item in which we need to get the arguments for dependency injection.
     */
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