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
export const getInitializer = (value, previousValue) => typeof value === 'function' ? value(previousValue) : value;
/**
 * Flatten a multidimensional object
 *
 * For example:
 *   flattenObject{ a: 1, b: { c: 2 } }
 * Returns:
 *   { a: 1, c: 2}
 */
export const flattenObject = (obj, previousPaths, total) => {
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (isPlainObject(value)) {
            flattenObject(value, [...previousPaths, key], total);
        }
        else {
            total.push([...previousPaths, key].join('.'));
        }
    });
    return total;
};
