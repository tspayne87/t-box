import { Token } from './Token';
import { RuleResult } from './RuleResult';
import { Rule } from './Rule';
import { StartEndRule } from './StartEndRule';

export class Lexor {
    private _rules: Rule[] = [];
    private _state: string = 'default';

    private _current: string = '';

    private _paramRegex: RegExp = /^.*=>/;

    public singleRule(pattern: RegExp, callback: (match: string) => RuleResult): Lexor {
        this._rules.push(new Rule(pattern, callback));
        return this;
    }

    public startEndRule(pattern: RegExp, endPattern: RegExp, callback: (match: string) => RuleResult): Lexor {
        this._rules.push(new StartEndRule(pattern, endPattern, callback));
        return this;
    }

    public parse(str: string) {
        let tokens: Token[] = [];
        while (str.length > 0) {
            let foundMatch = false;
            for (let i = 0; i < this._rules.length; ++i) {
                let rule: any = this._rules[i];
                let matches = str.match(rule.pattern);
                if (matches !== null && matches[0].length > 0) {
                    if (rule instanceof StartEndRule) {
                        let endRule = matches[0];
                        for (let j = endRule.length; j < str.length; ++j) {
                            endRule += str[j];
                            if (rule.endPattern.test(endRule)) {
                                let result = rule.callback(endRule);
                                if (result.accept !== undefined) {
                                    if (result.value === undefined) result.value = endRule;
                                    tokens.push(new Token(result.accept, result.value));
                                }
                                str = str.substr(endRule.length);
                                break;
                            }
                        }
                    } else if (rule instanceof Rule) {
                        let result = rule.callback(matches[0]);
                        if (result.accept !== undefined) {
                            if (result.value === undefined) result.value = matches[0];
                            tokens.push(new Token(result.accept, result.value));
                        }
                        str = str.substr(matches[0].length);
                    }
                    foundMatch = true;
                    break;
                }
            }
            if (!foundMatch) break;
        }
        return tokens;
    }
}