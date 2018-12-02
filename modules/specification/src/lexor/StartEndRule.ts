import { Rule } from './Rule';
import { RuleResult } from './RuleResult';

export class StartEndRule extends Rule {
    /**
     * Constructor to build out a start and end rule to determine what type of token is created.
     * 
     * @param pattern The pattern to start the rule.
     * @param endPattern The pattern that will end the rule.
     * @param callback The callback to determine the token.
     */
    constructor(pattern: RegExp, public endPattern: RegExp, callback: (match: string) => RuleResult) {
        super(pattern, callback);
    }
}