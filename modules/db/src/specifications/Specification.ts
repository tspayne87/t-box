import { tokenizeArrowFunc } from '../util';
import { Token } from '../lexor';
import { Model } from '../Model';

export interface ISpecificationTokenGroup {
    left?: Token;
    op: Token;
    right?: Token;
}

export type SpecificationToken = ISpecificationTokenGroup | ISpecificationTokenGroup[];

export class Specification<T extends Model> {
    public get tokens(): SpecificationToken[] {
        let tokens = tokenizeArrowFunc(this._spec.toString());
        return this.parseTokens(tokens);
    }

    constructor(private _spec: (item: T) => boolean, public vars?: { [key: string]: any }) { }

    private parseTokens(tokens: Token[]): SpecificationToken[] {
        let data: SpecificationToken[] = [];

        let inner = 0;
        let innerTokens: any[] = [];
        for (let i = 0; i < tokens.length; ++i) {
            let token = tokens[i];
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
                if (token.type === 'ref' || token.type === 'var' || token.type === 'data') {
                    if (token.type === 'ref') {
                        data.push({ left: token, op: tokens[++i], right: tokens[++i] });
                    } else {
                        let op = tokens[++i];
                        let left = tokens[++i];
                        data.push({ left, op, right: token });
                    }
                } else if (token.type === 'not') {
                    data.push({ op: token, right: tokens[++i] });
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