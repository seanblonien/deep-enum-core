import { Initializer, Pojo } from './types';
export declare const isPlainObject: (obj: unknown) => unknown;
/**
 * Prevents the object from changing or being mutated.
 *
 * @param obj the object to freeze
 * @returns the frozen object
 */
export declare function deepFreeze<T extends Pojo>(obj: T): T;
export declare const getInitializer: <T>(value: Initializer<T>, previousValue: T) => T;
/**
 * Flatten a multidimensional object
 *
 * For example:
 *   flattenObject{ a: 1, b: { c: 2 } }
 * Returns:
 *   { a: 1, c: 2}
 */
export declare const flattenObject: (obj: Pojo, previousPaths: string[], total: string[]) => string[];
