import { Token } from './Token';
import { RuleResult } from './RuleResult';
import { Rule } from './Rule';
import { StartEndRule } from './StartEndRule';

/**
 * Helper class that you can add rules to and parse a string into tokens based on the rules given.
 */
export class Lexor {
    // All the rules that this lexor should follow.
    private _rules: Rule[] = [];

    /**
     * Method is meant to add in a single rule that does not have an end to it.
     * 
     * @param pattern The pattern we are looking for with the lexor, make sure the begins with regex is used for each of the rules.
     * @param callback The callback method that will be used to determine what to do with the token and what type of token this is.
     */
    public singleRule(pattern: RegExp, callback: (match: string) => RuleResult): Lexor {
        this._rules.push(new Rule(pattern, callback));
        return this;
    }

    /**
     * Method is meant to add in a pairing rule that is mainly used to match a start and end rule.
     * 
     * @param pattern The starting pattern that will be used to go into the pairing system.
     * @param endPattern The ending pattern that will be used to exit out of the starting rule.
     * @param callback The callback method that will be used to determine what to do with the token and what type of token this is.
     */
    public startEndRule(pattern: RegExp, endPattern: RegExp, callback: (match: string) => RuleResult): Lexor {
        this._rules.push(new StartEndRule(pattern, endPattern, callback));
        return this;
    }

    /**
     * Method is meant to convert a string into a token list for use later down the line.
     * 
     * @param str The string that needs to be parsed and turned into tokens.
     */
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