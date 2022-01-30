import {
  DeepKeyOf,
  DeepPaths,
  DeepValueOf,
  Initializer,
  NestedValue,
  Path,
  PathValue,
  Pojo,
  Primitive,
  ValidateDeepEnumString,
} from './types';
import {deepFreeze, flattenObjectPaths, getInitializer, isPlainObject} from './utils';

export const makeDeepEnumString = <T extends Pojo>(obj: T) => {
  const result = deepFreeze(obj);
  return result as ValidateDeepEnumString<T> extends true ? typeof result : never;
};

/**
 * Gets the value at a given path in a deeply nested constant object.
 *
 * @param obj the object that contains the value to get
 * @param path tha path used to locate the value in this object
 * @returns the value stored at that path in obj
 */
export const get = <S extends Pojo, P extends Path<S>>(obj: S, path: P) =>
  path.split('.').reduce((prev, key) => prev[key] as S, obj) as PathValue<S, P>;

const setRecurse = <S extends Pojo>(
  obj: S,
  [prop, ...rest]: string[],
  value: Initializer<unknown>,
  {isMutable}: {isMutable?: boolean} = {isMutable: false},
) => {
  const newObj = isMutable ? obj : ((Array.isArray(obj) ? [...obj] : {...obj}) as Pojo);
  newObj[prop] = rest.length
    ? setRecurse(obj[prop] as S, rest, value)
    : getInitializer(value, obj[prop]);
  return newObj;
};

/**
 * Immutably sets a deeply nested property in the given object.
 *
 * @param obj the object whose nested property to change
 * @param path tha path used to locate the value to change in this object
 * @param value the new value to be set
 * @returns a new object with its nested property changed.
 */
export const set = <S extends Pojo, P extends Path<S>>(
  obj: S,
  path: P,
  value: Initializer<unknown>,
  options: {isMutable?: boolean} = {isMutable: false},
) => setRecurse(obj, path.split('.'), value, options) as S;

const processProperties = (obj: Pojo, previousPaths?: string[]) =>
  Object.keys(obj).reduce((a, c) => {
    a[c] = recurseProperties(
      (obj as Pojo<string, Pojo>)[c],
      previousPaths ? [...previousPaths, c] : [c],
    );
    return a;
  }, {} as Pojo);

function recurseProperties(currentObj: Pojo | Primitive, previousPaths: string[]) {
  // If is not pojo, return full path of property
  if (!isPlainObject(currentObj)) return previousPaths.join('.');
  // If pojo, recurse through each key of the pojo until each property has a path
  return processProperties(currentObj as Pojo<string, Pojo>, previousPaths);
}

export const makePathEnum = <T extends Pojo>(obj: T) =>
  deepFreeze(processProperties(obj)) as DeepPaths<T>;

export const getter =
  <S extends Pojo, P extends Path<S>>(obj: S) =>
  (path: P) =>
    path.split('.').reduce((prev, key) => prev[key] as S, obj) as PathValue<S, P>;

export const getDeepPaths = <S extends Pojo>(obj: S) =>
  Object.values(flattenObjectPaths(obj, [], []));

const getDeep = <S extends Pojo>(obj: S, paths: boolean) =>
  getDeepPaths(obj).reduce(
    (accum, current) =>
      paths
        ? {...accum, [current]: get(obj, current as Path<S>)}
        : [...(accum as NestedValue<S>[]), get(obj, current as Path<S>)],
    paths ? {} : [],
  );

export const getDeepKeyValues = <S extends Pojo>(obj: S) =>
  getDeep(obj, true) as Record<DeepKeyOf<S>, DeepValueOf<S>>;

export const getDeepValues = <S extends Pojo>(obj: S) => getDeep(obj, false) as NestedValue<S>[];
