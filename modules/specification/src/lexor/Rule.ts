import { RuleResult } from './RuleResult';

export class Rule {
    /**
     * Constructor to build out a rule to add into the lexor.
     * 
     * @param pattern The rule pattern for the token.
     * @param callback The callback to determine what type of token this is.
     */
    constructor(public pattern: RegExp, public callback: (match: string) => RuleResult) {
    }
}