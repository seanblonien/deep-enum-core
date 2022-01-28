import { DeepPaths, Initializer, Path, PathValue, Pojo } from './types';
export declare const makeDeepEnumString: <T extends Pojo<string, unknown>>(obj: T) => import("./types").IfEquals<Exclude<PathValue<T, Path<T>>, Record<string, unknown>>, import("./types").DeepKeyOf<T>, true, false> extends true ? T : never;
export declare const get: <S extends Pojo<string, unknown>, P extends Path<S>>(obj: S, path: P) => PathValue<S, P>;
export declare const set: <S extends Pojo<string, unknown>, P extends Path<S>>(obj: S, path: P, value: Initializer<unknown>, options?: {
    isMutable?: boolean;
}) => S;
export declare const makePathEnum: <T extends Pojo<string, unknown>>(obj: T) => DeepPaths<T, keyof T, "">;
export declare const getter: <S extends Pojo<string, unknown>, P extends Path<S>>(obj: S) => (path: P) => PathValue<S, P>;
