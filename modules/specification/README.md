# @t-box/specification
The T-box specification module handles generating queries based on conditional expressions in code.  This tries to mimic linq where clauses and expressions from C#.

## Features
- Simplify database queries for mongoose
- Generates smart queries and tries to consolidate where possible
- No dependencies

## Installation
### NPM
```bash
    npm install @t-box/specification
```
### Yarn
```bash
    yarn install @t-box/specification
```

## Usage
The basic usage of this is to generate queries for specific ORM's in nodeJs
```typescript
    // Adaptor is needed to determine how to build out the query.  In this case it is the mongoose adaptor.
    import '@t-box/specification/adaptors/mongoose/adaptor';
    import { Specification } from '@t-box/specification';

    // Create a query where isDeleted is equal to false.
    let boolSpec = new Specification<IPerson>(x => x.isDeleted === false);
    boolSpec.query(); // This will generate the mongoose query ready to be sent off.
```

More complex queries can be created, and even varables can be sent into be processed as well.
```typescript
    // Adaptor is needed to determine how to build out the query.  In this case it is the mongoose adaptor.
    import '@t-box/specification/adaptors/mongoose/adaptor';
    import { Specification } from '@t-box/specification';

    // Create a query where isDeleted is equal to false.
    let firstName = 'John';
    let startAge = 10;
    let endAge = 20;
    let andOr = new Specification<IPerson>(x => x.isDeleted && x.firstName === firstName && (x.age > startAge || x.age < endAge), { firstName, startAge, endAge });
    boolSpec.query(); // This will generate the mongoose query ready to be sent off.
```
The second argument to the specification is used to deal with variables passed into the arrow function.

## Future
This module needs a lot of work before I would suggest using it in a live project.  The following are the areas that need to be worked on
- Speed
- Allow Functions in the query
- Typescript compiler plugin to add in the variables on build
- Add in extra adaptors, working on sequelize now

## License
@t-box/specification is licensed under the [MIT license](https://opensource.org/licenses/MIT).