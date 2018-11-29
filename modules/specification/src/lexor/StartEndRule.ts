import { Rule } from './Rule';
import { RuleResult } from './RuleResult';

export class StartEndRule extends Rule {
    constructor(pattern: RegExp, public endPattern: RegExp, callback: (match: string) => RuleResult) {
        super(pattern, callback);
    }
}