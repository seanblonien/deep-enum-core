/**
 * Whether or not the given value is a plain JavaScript object (POJO).
 *
 * @param obj the value to check
 * @returns true if POJO, false otherwise
 */
export const isPlainObject = (obj) => obj && typeof obj === 'object' && Object.prototype === Object.getPrototypeOf(obj);
/**
 * Prevents the object from changing or being mutated.
 *
 * @param obj the object to freeze
 * @returns the frozen object
 */
export function deepFreeze(obj) {
    Object.keys(obj).forEach(key => {
        const o = obj[key];
        if (o && typeof o === 'object' && !Object.isFrozen(o))
            deepFreeze(o);
    });
    return Object.freeze(obj);
}
/**
 * Returns the value given be an initializer (a function that returns a value from a previous value, or a plain value)
 *
 * @param value the initializer to get the value from
 * @param previousValue the previous value to use when the initializer is a function
 * @returns the value from the initializer
 */
export const getInitializer = (value, previousValue) => typeof value === 'function' ? value(previousValue) : value;
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
export const flattenObjectPaths = (obj, previousPaths = [], accumulator = []) => {
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (isPlainObject(value)) {
            flattenObjectPaths(value, [...previousPaths, key], accumulator);
        }
        else {
            accumulator.push([...previousPaths, key].join('.'));
        }
    });
    return accumulator;
};
