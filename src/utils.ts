import {Initializer, InitializerUpdate, Pojo} from './types';

export const isPlainObject = (obj: unknown) =>
  obj && typeof obj === 'object' && Object.prototype === Object.getPrototypeOf(obj);

/**
 * Prevents the object from changing or being mutated.
 *
 * @param obj the object to freeze
 * @returns the frozen object
 */
export function deepFreeze<T extends Pojo>(obj: T): T {
  Object.keys(obj).forEach(key => {
    const o = obj[key];
    if (o && typeof o === 'object' && !Object.isFrozen(o)) deepFreeze(o as Pojo);
  });
  return Object.freeze(obj);
}

export const getInitializer = <T>(value: Initializer<T>, previousValue: T) =>
  typeof value === 'function' ? (value as InitializerUpdate<T>)(previousValue) : value;

/**
 * Flatten a multidimensional object
 *
 * For example:
 *   flattenObject{ a: 1, b: { c: 2 } }
 * Returns:
 *   { a: 1, c: 2}
 */
export const flattenObject = (obj: Pojo, previousPaths: string[], total: string[]) => {
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (isPlainObject(value)) {
      flattenObject(value as Pojo, [...previousPaths, key], total);
    } else {
      total.push([...previousPaths, key].join('.'));
    }
  });
  return total;
};
