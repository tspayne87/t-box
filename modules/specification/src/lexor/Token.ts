export class Token {
    /**
     * The token that is generated for the rules.
     * 
     * @param type The type of token.
     * @param value The value of this token.
     */
    constructor(public type: string, public value: any) {
    }
}