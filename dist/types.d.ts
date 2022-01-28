/**
 * JavaScript primitive types
 */
export declare type Primitive = string | number | boolean | symbol | null | undefined | bigint;
/**
 * Plain old JavaScript object. An object of key value pairs. Excludes arrays.
 */
export declare type Pojo<K extends string = string, V = unknown> = Record<K, V>;
declare type DotIfNotEmpty<Prefix extends string, Suffix extends string> = Prefix extends '' ? `${Suffix}` : `${Prefix}.${Suffix}`;
/**
 * A path mapping of an object where each property that is not another nested object becomes it's own path as a
 * dot-separated string.
 */
export declare type DeepPaths<T, K extends keyof T = keyof T, P extends string = ''> = K extends keyof T ? {
    [K in Exclude<keyof T, symbol | number>]: T[K] extends Pojo ? DeepPaths<T[K], keyof T[K], DotIfNotEmpty<P, K>> : DotIfNotEmpty<P, K>;
} : never;
/**
 * The path of a deeply nested object.
 */
export declare type PathImpl<T, K extends keyof T> = K extends string ? T[K] extends Record<string, unknown> ? T[K] extends ArrayLike<unknown> ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof unknown[]>>}` : K | `${K}.${PathImpl<T[K], keyof T[K]>}` : K : never;
declare type _Path<T> = PathImpl<T, keyof T> | keyof T;
/**
 * The path (combination of keys) of a property in a deeply nested object.
 */
export declare type Path<T> = _Path<T> extends string ? _Path<T> : never;
/**
 * The value of a property in a deeply nested object.
 */
export declare type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}` ? K extends keyof T ? Rest extends Path<T[K]> ? PathValue<T[K], Rest> : never : never : P extends keyof T ? T[P] : never;
/**
 * All possible values of a deeply nested object.
 */
export declare type NestedValue<P extends Pojo> = PathValue<P, Path<P>>;
/**
 * Checks if two types are equal. Will throw an error if the types are not equal.
 */
export declare type IfEquals<T, U, Y = true, N = never> = (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2 ? Y : N;
/**
 * Prefixes the string with a dot if not empty (if not the last in the recursion)
 */
declare type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;
/**
 * The deeply nested primitive-property keys of an object.
 */
export declare type DeepKeyOf<T, UseQuestion extends true | false = false> = ([
    T
] extends [never] ? '' : T extends Record<string, unknown> ? {
    [K in Exclude<keyof T, symbol>]: `${K}${UseQuestion extends true ? undefined extends T[K] ? '?' : '' : ''}${DotPrefix<DeepKeyOf<T[K], UseQuestion>>}`;
}[Exclude<keyof T, symbol>] : '') extends infer D ? Extract<D, string> : never;
/**
 * Selects the primitive-only values from a Record object
 */
declare type PrimitiveOnly<T, K extends string = string> = Exclude<T, Record<K, unknown>>;
/**
 * The deeply nested primitive-property values of an object.
 */
export declare type DeepValueOf<T extends Pojo> = PrimitiveOnly<NestedValue<T>>;
/**
 * Validates that the primitive-properties of an object are its own path.
 */
export declare type ValidateDeepEnumString<T extends Pojo> = IfEquals<DeepValueOf<T>, DeepKeyOf<T>>;
/**
 * An initializer function that returns a value of type T.
 */
export declare type InitializerUpdate<T> = (value: T) => T;
/**
 * An initializer value of function that returns a value of type T. This is the same type as the
 * first argument used by the `useState` hook.
 */
export declare type Initializer<T> = T | InitializerUpdate<T>;
export {};
