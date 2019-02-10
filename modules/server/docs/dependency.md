# Dependency
The servers way to handle dependency injection, it is a very simple object that handles singletons to be injected into controllers and injectors.

## Methods
### addSingle(injectable)
Method is meant to store an instance of an object for dependency injection.
- injectable :: An object that should be injected into the controllers and injectors.
### addDependency(dependency)
Method is meant to add a newable object and use the dependancy injection to build out that object and store it for future injections.
- dependency :: A newable object that needs to be stored for injection.
### resolve(dependency)
Method is meant to resolve the newable dependency and create an object based on the injectable objects.
- dependency :: A newable object that needs to be created.
### addScoped(dependency)
Method is meant to add in scoped dependencies that will not be created until a scope is generated.
- dependency :: A newable object that that be created in a scope.
### createScope(...injectables)
Method will generate a scope based on the current injectables and the scoped dependencies found, the scoped dependencies are generated in or of added.
- injectables ::  A list of injectables that also need to be added to the injectable list.

## Usage
```typescript
    import { Dependency } from '@t-box/server';
    
    class Animal {
        constructor(public legs: number, public arms: number) { }
    }

    class Tiger extends Animal {
        constructor() {
            super(4, 0);
        }
    }

    class Kangaroo extends Animal {
        constructor() {
            super(2, 2);
        }
    }

    class Zoo {
        constructor(public t: Tiger, public k: Kangaroo, public a: Animal) {
        }
    }

    let dependency = new Dependency();
    dependency.addSingle(new Animal(7, 7));
    dependency.addSingle(new Tiger());
    dependency.addSingle(new Kangaroo());

    let zoo = dependency.resolve(Zoo);
```