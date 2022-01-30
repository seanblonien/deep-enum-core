import { Initializer, Pojo } from './types';
/**
 * Whether or not the given value is a plain JavaScript object (POJO).
 *
 * @param obj the value to check
 * @returns true if POJO, false otherwise
 */
export declare const isPlainObject: (obj: unknown) => unknown;
/**
 * Prevents the object from changing or being mutated.
 *
 * @param obj the object to freeze
 * @returns the frozen object
 */
export declare function deepFreeze<T extends Pojo>(obj: T): T;
/**
 * Returns the value given be an initializer (a function that returns a value from a previous value, or a plain value)
 *
 * @param value the initializer to get the value from
 * @param previousValue the previous value to use when the initializer is a function
 * @returns the value from the initializer
 */
export declare const getInitializer: <T>(value: Initializer<T>, previousValue: T) => T;
/**
 * Flattens a deeply nested object into an array of paths.
 *
 * For example:
 *
 *   `flattenObject({ a: 1, b: { c: 2 } })`
 *
 * Returns:
 *
 *   `[ 'a', 'b.c' ]`
 */
export declare const flattenObjectPaths: (obj: Pojo, previousPaths?: string[], accumulator?: string[]) => string[];
