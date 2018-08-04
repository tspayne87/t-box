import { WhereOptions, Op, FindOptions, IncludeOptions } from 'sequelize';
import { Specification, SpecificationToken, ISpecificationTokenGroup } from '../../specifications/Specification';
import { Token } from '../../lexor';
import { Query } from '../../Query';
import { Model } from '../../Model';

export function parseSpecification<TModel extends Model>(spec: Specification<TModel>): WhereOptions<TModel> {
    return generateWhere(spec, spec.tokens);
}

export function parseInclude(include: string[]): IncludeOptions[] {
    return [];
    // let hasMany = Reflect.getMetadata(HASMANY, new this._constructor(), tokens[0].value);
    // if (hasMany !== undefined) {
    //     let options: IncludeOptions = {
    //         model: this._db.model(hasMany.table),
    //         as: tokens[0].value
    //     };
    //     if (spec !== undefined) options.where = <any>spec.where();
    //     this.options.include.push(options);
    // }
    // return this;
}

export function parseOrder(order: string | string[] | Object) {
    if (typeof order === 'string') {
        return [[order, 'ASC']];
    } else if (Array.isArray(order)) {
        return order.map(x => [x, 'ASC']);
    } else {
        let keys = Object.keys(order);
        return keys.map(x => [x, order[x]]);
    }
}

export function parseQuery<TModel extends Model>(query: Query<TModel>): FindOptions<TModel> {
    let queryOptions = query.options;
    let options: FindOptions<TModel> = {};
    if (queryOptions.where !== undefined) options.where = parseSpecification(queryOptions.where);
    if (queryOptions.include !== undefined) options.include = parseInclude(queryOptions.include);
    if (queryOptions.group !== undefined) options.group = queryOptions.group;
    if (queryOptions.order !== undefined) options.order = parseOrder(queryOptions.order);
    if (queryOptions.limit !== undefined) options.limit = queryOptions.limit;
    if (queryOptions.offset !== undefined) options.offset = queryOptions.offset;
    return options;
}

function generateWhere<TModel extends Model>(spec: Specification<TModel>, parsedTokens: SpecificationToken[]): any {
    if (parsedTokens.length === 1) {
        return generateClause(spec, <ISpecificationTokenGroup>parsedTokens[0]);
    } else {
        let op = getOperator((<ISpecificationTokenGroup>parsedTokens[1]).op);
        let conditions: any[] = [];
        for (let i = 0; i < parsedTokens.length; i += 2) {
            if (!Array.isArray(parsedTokens[i])) {
                conditions.push(generateClause(spec, <ISpecificationTokenGroup>parsedTokens[i]));
            } else {
                conditions.push(generateWhere(spec, <SpecificationToken[]>parsedTokens[i]));
            }
        }
        return { [op]: conditions };
    }
}

function generateClause<TModel extends Model>(spec: Specification<TModel>, clause: ISpecificationTokenGroup) {
    if (clause.left === undefined) {
        return { [ getValue(spec, clause.right) ]: { [Op.eq]: false } };
    } else {
        return { [ getValue(spec, clause.left) ]: { [ getOperator(clause.op) ]: getValue(spec, clause.right) } };
    }
}

function getValue<TModel extends Model>(spec: Specification<TModel>, item?: Token): any {
    if (item !== undefined) {
        if (item.type === 'ref') {
            return item.value;
        }
        else if (item.type === 'var') {
            if (!spec.vars) throw 'Variables need to be passed in if you want to use the variable feature';
            if (spec.vars && !spec.vars.hasOwnProperty(item.value)) throw 'Variable could not be found for use in the spec';
            return spec.vars[item.value];
        } else if (item.type === 'val') {
            return eval(item.value);
        }
    }
    return undefined;
}

function getOperator(op: Token): symbol {
    switch (op.type) {
        case 'and': return Op.and;
        case 'or': return Op.or;
        case 'gt': return Op.gt;
        case 'gte': return Op.gte;
        case 'lt': return Op.lt;
        case 'lte': return Op.lte;
        case 'ne': return Op.ne;
        case 'eq': return Op.eq;
        case 'not': return Op.not;
    }
    throw `Operator [${op.type}] could not be generated`;
}