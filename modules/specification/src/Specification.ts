import { tokenizeArrowFunc } from './util';
import { Token } from './lexor';

export interface ISpecificationTokenGroup {
    left?: Token;
    op: Token;
    right?: Token;
}

export type SpecificationToken = ISpecificationTokenGroup | ISpecificationTokenGroup[];

export class Specification<T> {
    constructor(private _spec: (item: T) => boolean, public vars?: { [key: string]: any }) { }

    public query(): any {
        throw 'Please use an adaptor, @square-one/specification/adaptors/<adaptor>/adaptor.ts';
    }

    private get tokens(): SpecificationToken[] {
        let tokens = tokenizeArrowFunc(this._spec.toString());
        return this.parseTokens(tokens);
    }

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