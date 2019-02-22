/**
 * Decorator to inject elements into functions.
 */
export function Inject(target: Object, propertyKey: string | symbol, parameterIndex: number): any {
    console.log(arguments);
    return target;
}