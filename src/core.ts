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
  Mutable,
  ToPrimitive,
} from '@types';
import {deepFreeze, flattenObjectPaths, getInitializer, isPlainObject} from '@utils';

/**
 * Seals and validates the given object is a valid deep-enum object, and makes it immutable (like an enum).
 *
 * @param obj the object to validate the deep-enum type of
 * @param freeze whether or not to make the deep-enum returned readonly (deeply froezen), defaults to `true`
 * @returns the deep-enum object with validated type, or `never` if invalid
 */
export const sealDeepEnum = <T extends Pojo, B extends true | false = true>(
  obj: T,
  freeze = true as B,
) => {
  const result = freeze ? deepFreeze(obj) : obj;
  return result as ValidateDeepEnumString<T> extends true
    ? B extends true
      ? typeof result
      : Mutable<typeof result>
    : never;
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
 * @returns the value stored at that path in object, or `undefined` if the path does not exist in the object
 */
export const get = <S extends Pojo, P extends Path<S>>(obj: S, path: P) =>
  path.split('.').reduce((prev, key) => prev[key] as S, obj) as PathValue<S, P>;

type SetOptions = {isMutable?: boolean};

const setRecursive = <S extends Pojo, P extends Path<S>>(
  obj: S,
  [prop, ...rest]: string[],
  value: Initializer<ToPrimitive<PathValue<S, P>>>,
  options: SetOptions,
) => {
  const newObj = options.isMutable ? obj : ({...obj} as Pojo);
  newObj[prop] = rest.length
    ? setRecursive(obj[prop] as S, rest, value, options)
    : getInitializer(value, obj[prop]);
  return newObj;
};

/**
 * Sets a deeply nested property in the given object, immutably or mutably
 *
 * @param obj the object whose nested property to change
 * @param path the path used to locate the value to change in this object
 * @param value the new value to be set at the given path
 * @param options configurations that change how the value is set
 * @returns a new object with its nested property changed if immutable, or the original object if mutable
 */
const set_ = <S extends Pojo, P extends Path<S>>(
  obj: S,
  path: P,
  value: Initializer<ToPrimitive<PathValue<S, P>>>,
  options: SetOptions,
) => setRecursive(obj, path.split('.'), value, options) as S;

/**
 * Sets a deeply nested property mutably (by changing the property directly) in the given object
 *
 * @param obj the object whose nested property to change
 * @param path the path used to locate the value to change in this object
 * @param value the new value to be set at the given path
 * @returns the original object (with its nested property changed)
 */
export const setMutable = <S extends Pojo, P extends Path<S>>(
  obj: S,
  path: P,
  value: Initializer<ToPrimitive<PathValue<S, P>>>,
) => set_(obj, path, value, {isMutable: true});

/**
 * Sets a deeply nested property immutably (by creating a new object), copying all other values of the original object
 *
 * @param obj the object whose nested property to change
 * @param path the path used to locate the value to change in this object
 * @param value the new value to be set at the given path
 * @returns a new object with its nested property changed if immutable, or the original object if mutable
 */
export const setImmutable = <S extends Pojo, P extends Path<S>>(
  obj: S,
  path: P,
  value: Initializer<ToPrimitive<PathValue<S, P>>>,
) => set_(obj, path, value, {isMutable: false});

/**
 * Sets a deeply nested property immutably (by creating a new object), copying all other values of the original object
 *
 * @param obj the object whose nested property to change
 * @param path the path used to locate the value to change in this object
 * @param value the new value to be set at the given path
 * @returns a new object with its nested property changed if immutable, or the original object if mutable
 */
export const set = setImmutable;

const processProperties = (obj: Pojo, previousPaths: string[], postfixIdentifier: string) =>
  Object.keys(obj).reduce((a, c) => {
    a[c] = recurseProperties(
      (obj as Pojo<string, Pojo>)[c],
      [...previousPaths, c],
      postfixIdentifier,
    );
    return a;
  }, {} as Pojo);

function recurseProperties(
  currentObj: Pojo | Primitive,
  previousPaths: string[],
  postfixIdentifier: string,
) {
  // If is not pojo, return full path of property
  if (!isPlainObject(currentObj)) return previousPaths.join('.') + postfixIdentifier;
  // If pojo, recurse through each key of the pojo until each property has a path
  return processProperties(currentObj as Pojo<string, Pojo>, previousPaths, postfixIdentifier);
}

/**
 * Creates a setter for the given object
 *
 * @param obj the object to set values on
 * @param options configurations that change how the value is set
 * @returns a function that takes a path and and value to change set that value at that given path in the object
 */
export const createSet =
  <S extends Pojo>(obj: S, options: SetOptions = {isMutable: false}) =>
  <P extends Path<S>>(path: P, value: Initializer<ToPrimitive<PathValue<S, P>>>) =>
    set_(obj, path, value, options);

/**
 * Creates a setter for the given object at the given path
 *
 * @param obj the object to set value of
 * @param path the path of the value that you want to make a setter for
 * @param options configurations that change how the value is set
 * @returns a function that takes a value that updates the value at the given path of the object
 */
export const createDeepSet =
  <S extends Pojo, P extends Path<S>>(obj: S, path: P, options: SetOptions = {isMutable: false}) =>
  (value: Initializer<ToPrimitive<PathValue<S, P>>>) =>
    set_(obj, path, value, options);

/**
 * Generates a deep-enum interface object from a regular object that can be used as an enum accessor to an
 * object with the same interface.
 *
 * [Detailed API with examples for `createDeepEnumInterface`](https://github.com/seanblonien/deep-enum-core#createdeepenuminterfaceobj-postfixidentifier)
 *
 * @param obj the object to generate the deep-enum from, must be a plain object or record or key-value pair object
 * @param postfixIdentifier the value to append to the end of a path when generating the enum values.
 * @returns the deep-enum object which holds the paths that can be used to index into the same interface
 */
export const createDeepEnumInterface = <T extends Pojo, PostFixType extends string = ''>(
  obj: T,
  postfixIdentifier = '' as PostFixType,
) => sealDeepEnum(processProperties(obj, [], postfixIdentifier) as DeepPaths<T, PostFixType>);

/**
 * Creates a deep enum constant object by making it immutable
 *
 * @param obj the object with constant values that you want to freeze
 * @returns the same object, but with frozen keys/values
 */
export const deepEnumConstant = <T extends Pojo>(obj: T) => sealDeepEnum(obj);

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
 * Generates a deep-enum object using {@link createDeepEnumInterface} and getter for getting values from the
 * original object using {@link createGet}.
 *
 * @param obj the object to generate the deep-enum from, must be a plain object
 * @returns a tuple where the first value is the the deep-enum object, and the second value is the getter on the
 * original object
 */
export const createDeepEnumWithGet = <T extends Pojo>(obj: T) => {
  const deepEnum = createDeepEnumInterface(obj);
  const getEnum = createGet(obj);
  return [deepEnum, getEnum] as const;
};

const createDeepEnumFullInternal = <T extends Pojo>(obj: T, options?: SetOptions) => {
  const deepEnum = createDeepEnumInterface(obj);
  const getEnum = createGet(obj);
  const setEnum = createSet(obj, options);
  return [deepEnum, getEnum, setEnum] as const;
};

/**
 * Creates a deep enum with getter and mutable setter
 *
 * @param obj the object to make a deep enum out of
 * @returns an array of 3 values
 *   1. the deep enum constant object
 *   1. a getter to access values by path in the object
 *   1. a setter to set values by path in the object
 */
export const createDeepEnumFullMutable = <T extends Pojo>(obj: T) =>
  createDeepEnumFullInternal(obj, {isMutable: true});

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
  Object.values(flattenObjectPaths(obj, [], [])) as DeepKeyOf<S>[];

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
export const getDeepValues = <S extends Pojo>(obj: S) => getDeep(obj, 'array') as DeepValueOf<S>[];
