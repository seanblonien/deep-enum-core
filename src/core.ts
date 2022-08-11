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
} from '@types';
import {deepFreeze, flattenObjectPaths, getInitializer, isPlainObject} from '@utils';

/**
 * Seals and validates the given object is a valid deep-enum object, and makes it immutable (like an enum).
 *
 * @param obj the object to validate the deep-enum type of
 * @param isReadonly whether or not to make the deep-enum returned readonly (deeply froezen), defaults to `true`
 * @returns the deep-enum object with validated type, or `never` if invalid
 */
export const sealDeepEnum = <T extends Pojo>(obj: T, freeze = true) => {
  const result = freeze ? deepFreeze(obj) : obj;
  return result as ValidateDeepEnumString<T> extends true ? typeof result : never;
};

/**
 * Gets the value at a given path in a deeply nested POJO.
 *
 * @param obj the object that contains the value to get
 * @param path the path used to locate the value in this object.
 *
 * The path *MUST* be a valid, dot-separated path string that properly indexes the given object, or else run-time
 * errors will be thrown. If you object the TypeScript interface, errors will be thrown statically that the path is
 * invalid, but all bets are off if you have a bad assertion.
 *
 * @returns the value stored at that path in object, or `undefined` if the path does not exist in the object
 */
export const get = <S extends Pojo, P extends Path<S>>(obj: S, path: P) =>
  path.split('.').reduce((prev, key) => prev[key] as S, obj) as PathValue<S, P>;

const setRecursive = <S extends Pojo>(
  obj: S,
  [prop, ...rest]: string[],
  value: Initializer<unknown>,
  options: {isMutable?: boolean} = {isMutable: false},
) => {
  const newObj = options.isMutable ? obj : ((Array.isArray(obj) ? [...obj] : {...obj}) as Pojo);
  newObj[prop] = rest.length
    ? setRecursive(obj[prop] as S, rest, value, options)
    : getInitializer(value, obj[prop]);
  return newObj;
};

/**
 * Sets a deeply nested property in the given object, immutably by default (but can be mutable).
 *
 * @param obj the object whose nested property to change
 * @param path the path used to locate the value to change in this object
 * @param value the new value to be set as the given path
 * @returns a new object with its nested property changed if immutable, or the original object is mutable
 */
export const set = <S extends Pojo, P extends Path<S>>(
  obj: S,
  path: P,
  value: Initializer<unknown>,
  options: {isMutable?: boolean} = {isMutable: false},
) => setRecursive(obj, path.split('.'), value, options) as S;

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

/**
 * Generates a deep-enum object from a regular object that can be used as an enum accessor to the original object.
 *
 * @param obj the object to generate the deep-enum from, must be a plain object
 * @returns the deep-enum object
 */
export const createDeepEnum = <T extends Pojo>(obj: T) =>
  sealDeepEnum(processProperties(obj) as DeepPaths<T>) as DeepPaths<T>;

/**
 * Creates the equivalent {@link get} function where the object is implicitly used as an argument. Useful if
 * you are doing multiple gets on the same object in various places.
 *
 * @param obj the object to provide to the {@link get} method
 * @returns a function that can be used to access values from the wrapped object
 */
export const createGet =
  <S extends Pojo, P extends Path<S>>(obj: S) =>
  (path: P) =>
    get(obj, path);

/**
 * Creates the equivalent {@link createGet} function where the path is implicitly used as an argument. Useful if
 * you are doing multiple gets on the same path within an object in various places.
 *
 * @param obj the object to provide to the internal {@link get} method
 * @param path the path to provide to the internal {@link get} method
 * @returns a function that returns the given value for this object at the given path
 */
export const createDeepGet =
  <S extends Pojo, P extends Path<S>>(obj: S, path: P) =>
  () =>
    get(obj, path);

/**
 * Generates a deep-enum object using {@link createDeepEnum} and getter for getting values from the original object
 * using {@link createGet}.
 *
 * @param obj the object to generate the deep-enum from, must be a plain object
 * @returns a tuple where the first value is the the deep-enum object, and the second value is the getter on the
 * original object
 */
export const createDeepEnumWithGet = <T extends Pojo>(obj: T) => {
  const deepEnum = createDeepEnum(obj);
  const getEnum = createGet(obj);
  return [deepEnum, getEnum] as const;
};

/**
 * Gets a list of all of the deeply-nested paths in the given object. Flattens the deeply nested values and
 * returns those values' keys.
 *
 * These are the paths to all of the "leaves" of the object, i.e. the properties whose values are primitives who are
 * not nested further.
 *
 * @param obj the object to flatten and get the keys of the deeply nested values
 * @returns a list of all of the deeply-nested paths in the given object
 */
export const getDeepPaths = <S extends Pojo>(obj: S) =>
  Object.values(flattenObjectPaths(obj, [], []));

// Using all of the deep paths of an object, get the value at each path into an array or object
const getDeep = <S extends Pojo>(obj: S, type: 'obj' | 'array') =>
  getDeepPaths(obj).reduce(
    (accum, current) =>
      type === 'obj'
        ? {...accum, [current]: get(obj, current as Path<S>)}
        : [...(accum as NestedValue<S>[]), get(obj, current as Path<S>)],
    type === 'obj' ? {} : [],
  );

/**
 * Creates a list of all of the deeply-nested values in the given object. Flattens the deeply nested values into a list.
 *
 * These values are the "leaves" of the object, i.e. the properties whose values are primitives who are
 * not nested further.
 *
 * @param obj the object to flatten and get the keys of the deeply nested values
 * @returns a list of all of the deeply-nested paths in the given object
 */
export const getDeepKeyValues = <S extends Pojo>(obj: S) =>
  getDeep(obj, 'obj') as Record<DeepKeyOf<S>, DeepValueOf<S>>;

/**
 * Gets the deeply-nested values in the given object and flattens those properties at the top level, where their
 * keys are their full-path in the original object.
 *
 * @param obj the object to get the deep values of
 * @returns an object where the keys are the full-paths of the deeply-nested values in the given object
 */
export const getDeepValues = <S extends Pojo>(obj: S) => getDeep(obj, 'array') as NestedValue<S>[];
