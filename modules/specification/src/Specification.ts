import { tokenizeArrowFunc } from './util';
import { Token } from './lexor';

/**
 * Helper interface that will give the left and right side of the logical expression.
 */
export interface ISpecificationTokenGroup {
    left?: Token;
    op: Token;
    right?: Token;
}

/**
 * Specification token that can be generated from the token getter.
 */
export type SpecificationToken = ISpecificationTokenGroup | ISpecificationTokenGroup[];

/**
 * Class to help with boolean expressions that need to be ran on a database server.
 */
export class Specification<T> {
    /**
     * Basic constructor to build out a specification based on the arrow function given.
     * 
     * @param _spec The boolean callback array function that will determine what type of query needs to be generated on the database.
     * @param vars The variables that need to be passed in if they are used in the spec.
     */
    constructor(private _spec: (item: T) => boolean, public vars?: { [key: string]: any }) { }

    /**
     * Method is meant to generate a query based on what type of adaptor is used.
     */
    public query(): any {
        throw 'Please use an adaptor, @square-one/specification/adaptors/<adaptor>/adaptor.ts';
    }

    /**
     * Internal getter method that is used in the adaptors to get the tokens needed to build out the query based
     * on their type of database.
     */
    private get tokens(): SpecificationToken[] {
        let tokens = tokenizeArrowFunc(this._spec.toString());
        return this.parseTokens(tokens);
    }

    /**
     * Method is meant to parse the tokens into a specification token list for use in the adaptors, that will allow them to create
     * queries that a client would need.
     * 
     * @param tokens The tokens generated from the lexor.
     */
    private parseTokens(tokens: Token[]): SpecificationToken[] {
        let data: SpecificationToken[] = [];

        let inner = 0;
        let innerTokens: any[] = [];
        for (let i = 0; i < tokens.length; ++i) {
            let token = tokens[i];
            let next = tokens[i + 1];
            if (inner > 0) {
                if (token.type === 'opar') {
                    inner++;
                    innerTokens.push(token);
                } else if (token.type === 'cpar') {
                    inner--;
                    if (inner === 0) {
                        data.push(<ISpecificationTokenGroup[]>this.parseTokens(innerTokens));
                    } else {
                        innerTokens.push(token);
                    }
                } else {
                    innerTokens.push(token);
                }
            } else {
                if (token.type === 'ref' || token.type === 'var' || token.type === 'val') {
                    if (token.type === 'ref') {
                        if (next !== undefined && (next.type === 'and' || next.type === 'or')) {
                            data.push({ left: token, op: new Token('eq', '==='), right: new Token('val', true) });
                        } else {
                            data.push({ left: token, op: tokens[++i], right: tokens[++i] || new Token('val', true) });
                        }
                    } else {
                        let op = tokens[++i];
                        let left = tokens[++i];
                        data.push({ left, op, right: token });
                    }
                } else if (token.type === 'not') {
                    if (tokens[i + 1].type === 'opar' || tokens[i + 1].type === 'not') {
                        if (data.length > 0 && !Array.isArray(data[data.length - 1]) && (<any>data[data.length - 1]).op.type === 'not') {
                            // Two negations just needs to be cleaned up.
                            data.pop();
                        } else {
                            data.push({ op: token });
                        }
                    } else {
                        if (data.length > 0 && !Array.isArray(data[data.length - 1]) && (<any>data[data.length - 1]).op.type === 'not') {
                            data.pop();
                            data.push({ op: new Token('eq', '==='), left: tokens[++i], right: new Token('val', true) });
                        } else {
                            data.push({ op: token, left: tokens[++i], right: new Token('val', true) });
                        }
                    }
                } else if (token.type === 'and' || token.type === 'or') {
                    data.push({ op: token });
                } else if (token.type === 'opar') {
                    innerTokens = [];
                    inner++;
                }
            }
        }
        return data;
    }
}