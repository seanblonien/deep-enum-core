import {Initializer, InitializerUpdate, Pojo} from './types';

export const isPlainObject = (obj: unknown) =>
  obj && typeof obj === 'object' && Object.prototype === Object.getPrototypeOf(obj);
// export {default as isPlainObject} from 'lodash/isPlainObject';

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
