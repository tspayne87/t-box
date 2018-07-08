import { WhereOptions, Op } from 'sequelize';
import * as Tokenizr from 'tokenizr';
import { Model } from '../Model';

export class Spec<T extends Model> {
    constructor(private _spec: (item: T) => any, private _vars?: { [key:string]: any }) {
    }

    public parse(): WhereOptions<T> {
        let parsedTokens = this.parseTokens(this.tokens());
        return this.generateWhere(parsedTokens);
    }

    private generateWhere(parsedTokens): any {
        if (parsedTokens.length === 1) {
            return this.generateClause(parsedTokens[0]);
        } else {
            let op = this.getOperator(parsedTokens[1].op);
            let conditions: any[] = [];
            for(let i = 0; i < parsedTokens.length; i+=2) {
                if (parsedTokens[i].length === undefined) {
                    conditions.push(this.generateClause(parsedTokens[i]));
                } else {
                    conditions.push(this.generateWhere(parsedTokens[i]));
                }
            }
            return { [op]: conditions };
        }
    }

    private generateClause(clause) {
        if (clause.left === undefined) {
            return { [this.getValue(clause.right)]: { [Op.eq]: false } };
        } else {
            return { [this.getValue(clause.left)]: { [this.getOperator(clause.op)]: this.getValue(clause.right) } };
        }
    }

    private getValue(item): any {
        if (item.type === 'ref') {
            return item.value;
        }
        else if (item.type === 'var') {
            if (!this._vars) throw 'Variables need to be passed in if you want to use the variable feature';
            if (this._vars && !this._vars[item.value]) throw 'Variable could not be found for use in the spec';
            return this._vars[item.value];
        } else if (item.type === 'val') {
            return eval(item.value);
        }
    }

    private getOperator(op): symbol {
        switch(op.type) {
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

    private parseTokens(tokens) {
        let data: any[] = [];

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
                        data.push(this.parseTokens(innerTokens));
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
                        var op = tokens[++i];
                        var left = tokens[++i];
                        data.push({ left, op, right: token });
                    }
                } else if(token.type === 'not') {
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

    private tokens() {
        let lexor = new Tokenizr();
        let param = '';
        lexor.rule(/^.*=>/, (ctx, match) => {
            param = match[0].replace('=>', '').trim();
            ctx.ignore();
        });

        //#region Rules for operators
        lexor.rule(/&&/, ctx => ctx.accept('and'));
        lexor.rule(/\|\|/, ctx => ctx.accept('or'));
        lexor.rule(/==+/, ctx => ctx.accept('eq'));
        lexor.rule(/!=+/, ctx => ctx.accept('ne'));
        lexor.rule(/>=*/, (ctx, match) => ctx.accept(/=/.test(match[0]) ? 'gte' : 'gt'));
        lexor.rule(/<=*/, (ctx, match) => ctx.accept(/=/.test(match[0]) ? 'lte' : 'lt'));
        lexor.rule(/!/, ctx => ctx.accept('not'));
        //#endregion

        //#region Rules for Parentheses
        lexor.rule(/\(/, ctx => ctx.accept('opar'));
        lexor.rule(/\)/, ctx => ctx.accept('cpar'));
        //#endregion

        //#region Rules for values
        lexor.rule(/['|"].*['|"]/, (ctx, match) => ctx.accept('val', match[0].trim()));
        lexor.rule(/ *new .*\(.*\)/, (ctx, match) => ctx.accept('val', match[0].trim()));
        //#endregion

        //#region Rules for reference, functions and variables
        lexor.rule(/ *[a-zA-Z\.]*\([a-zA-Z\.,]*\)/, (ctx, match) => {
            let value = match[0].trim();
            if (value === '') return ctx.ignore();
            if (value.indexOf(`${param}.`) === -1) {
                ctx.accept('var', value);
            } else {
                ctx.accept('ref', value.replace(`${param}.`, ''));
            }
        });

        lexor.rule(/ *[a-zA-Z\.]*/, (ctx, match) => {
            let value = match[0].trim();
            if (value === '') return ctx.ignore();
            if (value.indexOf(`${param}.`) === -1) {
                ctx.accept('var', value);
            } else {
                ctx.accept('ref', value.replace(`${param}.`, ''));
            }
        });
        //#endregion

        let func = this._spec.toString().replace(/(\r\n|\r|\n)/g, '').trim();
        lexor.input(func);
        return lexor.tokens();
    }
}