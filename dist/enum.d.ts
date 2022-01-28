import { DeepPaths, Initializer, Path, PathValue, Pojo } from './types';
export declare const makeDeepEnumString: <T extends Pojo<string, unknown>>(obj: T) => import("./types").IfEquals<Exclude<PathValue<T, Path<T>>, Record<string, unknown>>, import("./types").DeepKeyOf<T, false>, true, never> extends true ? T : never;
/**
 * Gets the value at a given path in a deeply nested constant object.
 *
 * @param obj the object that contains the value to get
 * @param path tha path used to locate the value in this object
 * @returns the value stored at that path in obj
 */
export declare const get: <S extends Pojo<string, unknown>, P extends Path<S>>(obj: S, path: P) => PathValue<S, P>;
/**
 * Immutably sets a deeply nested property in the given object.
 *
 * @param obj the object whose nested property to change
 * @param path tha path used to locate the value to change in this object
 * @param value the new value to be set
 * @returns a new object with its nested property changed.
 */
export declare const set: <S extends Pojo<string, unknown>, P extends Path<S>>(obj: S, path: P, value: Initializer<unknown>, options?: {
    isMutable?: boolean;
}) => S;
export declare const makePathEnum: <T extends Pojo<string, unknown>>(obj: T) => DeepPaths<T, keyof T, "">;
export declare const getter: <S extends Pojo<string, unknown>, P extends Path<S>>(obj: S) => (path: P) => PathValue<S, P>;
export declare const getDeepPaths: <S extends Pojo<string, unknown>>(obj: S) => string[];
export declare const getDeepValues: <S extends Pojo<string, unknown>>(obj: S) => PathValue<S, Path<S>>[];
