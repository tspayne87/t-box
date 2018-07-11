import { RuleResult } from './RuleResult';

export class Rule {
    constructor(public pattern: RegExp, public callback: (match: string) => RuleResult) {
    }
}