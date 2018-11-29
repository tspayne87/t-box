import { Specification, SpecificationToken, ISpecificationTokenGroup } from '../../Specification';
import { Token } from '../../lexor';


Specification.prototype.query = function() {

    console.log((<any>this).tokens);
    return generateQuery((<any>this).tokens, this.vars);
};

function generateQuery(tokens: SpecificationToken[], vars?: { [key: string]: any }) {
    let result: any = {};
    if (tokens.length === 1) {
        let token = tokens[0];
        if (Array.isArray(token)) {
            return generateQuery(token, vars);
        } else {
            return generateField(token, vars);
        }
    } else {
        let op: string = Array.isArray(tokens[1]) ? '$and' : getOperator((<ISpecificationTokenGroup>tokens[1]).op);
        for (let i = 0; i < tokens.length; i += 2) {
            let token = tokens[i];
            let opToken = <ISpecificationTokenGroup>tokens[i - 1];
            let curOp = opToken === undefined ? op : getOperator(opToken.op);
            if (op.length === 0) op = curOp;
            result[op] = result[op] || [];

            if (Array.isArray(token)) {
                let query = generateQuery(token, vars);
                if (curOp !== op) query = { $or: [ query ] };
                result[op].push(query);
            } else {
                if (token.op.type === 'not' && token.left === undefined && token.right === undefined && Array.isArray(tokens[i + 1])) {
                    let query = generateQuery(<SpecificationToken[]>tokens[++i], vars);
                    if (curOp !== op) query = { $or: [ query ] };
                    result[op].push({ $not: query });
                } else {
                    let field = generateField(token, vars);
                    if (curOp !== op) field = { $or: [ field ] };
                    result[op].push(field);
                }
            }
        }
    }
    return result;
}

function generateField(token: ISpecificationTokenGroup, vars?: { [key: string]: any }): any {
    if (token.left === undefined || token.left.type !== 'ref') throw 'value to value comparison is not allowed.';
    let op = token.op === undefined ? '$eq' : getOperator(token.op);
    return { [token.left.value]: { [op]: getValue(token.right, vars) } };
}

function getValue(token?: Token, vars?: { [key: string]: any }): any {
    if (token !== undefined) {
        if (token.type === 'ref') return `$${token.value}`;
        if (token.type === 'val') return token.value;
        if (token.type === 'var') {
            if (!vars) throw 'Variables need to be passed in if you want to use the variable feature';
            if (vars && !vars.hasOwnProperty(token.value)) throw 'Variable could not be found for use in the spec';
            return vars[token.value] || null;
        }
    }
    return undefined;
}

function getOperator(op: Token): string {
    switch (op.type) {
        case 'and': return '$and';
        case 'or': return '$or';
        case 'gt': return '$gt';
        case 'gte': return '$gte';
        case 'lt': return '$lt';
        case 'lte': return '$lte';
        case 'ne': return '$ne';
        case 'eq': return '$eq';
        case 'not': return '$not';
    }
    throw `Operator [${op.type}] could not be generated`;
}