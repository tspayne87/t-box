/**
 * Dependency that requires the object to be a class or a newable function.
 */
export interface IDependency {
  new (...args: any[]): any;
}