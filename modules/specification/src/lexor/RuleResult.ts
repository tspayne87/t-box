/**
 * The result of the rule to determine what type of token will be created.
 */
export class RuleResult {
    public ignore?: boolean;
    public accept?: string;
    public value?: any | null;
}