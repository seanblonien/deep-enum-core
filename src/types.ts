/**
 * JavaScript primitive types
 */
export type Primitive = string | number | boolean | symbol | null | undefined | bigint;

/**
 * Plain old JavaScript object. An object of key value pairs. Excludes arrays.
 */
export type Pojo<K extends string = string, V = unknown> = Record<K, V>;

type DotIfNotEmpty<Prefix extends string, Suffix extends string> = Prefix extends ''
  ? `${Suffix}`
  : `${Prefix}.${Suffix}`;

/**
 * A path mapping of an object where each property that is not another nested object becomes it's own path as a
 * dot-separated string.
 */
export type DeepPaths<
  T,
  Suffix extends string = '',
  K extends keyof T = keyof T,
  P extends string = '',
> = K extends keyof T
  ? {
      [K in Exclude<keyof T, symbol | number>]: T[K] extends Pojo
        ? DeepPaths<T[K], Suffix, keyof T[K], DotIfNotEmpty<P, K>>
        : DotIfNotEmpty<P, `${K}${Suffix}`>;
    }
  : never;

/**
 * The path of a deeply nested object.
 */
export type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? T[K] extends ArrayLike<unknown>
      ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof unknown[]>>}`
      : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never;

type _Path<T> = PathImpl<T, keyof T> | keyof T;

/**
 * The path (combination of keys) of a property in a deeply nested object.
 */
export type Path<T> = _Path<T> extends string ? _Path<T> : never;

/**
 * The value of a property in a deeply nested object.
 */
export type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

/**
 * All possible values of a deeply nested object.
 */
export type NestedValue<P extends Pojo> = PathValue<P, Path<P>>;

/**
 * Checks if two types are equal. Will throw an error if the types are not equal.
 */
export type IfEquals<T, U, Y = true, N = never> = (<G>() => G extends T ? 1 : 2) extends <
  G,
>() => G extends U ? 1 : 2
  ? Y
  : N;

// https://dev.to/pffigueiredo/typescript-utility-keyof-nested-object-2pa3
/**
 * Prefixes the string with a dot if not empty (if not the last in the recursion)
 */
type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;
/**
 * The deeply nested primitive-property keys of an object.
 */
export type DeepKeyOf<T, UseQuestion extends true | false = false> = (
  [T] extends [never]
    ? ''
    : T extends Record<string, unknown>
    ? {
        [K in Exclude<keyof T, symbol>]: `${K}${UseQuestion extends true
          ? undefined extends T[K]
            ? '?'
            : ''
          : ''}${DotPrefix<DeepKeyOf<T[K], UseQuestion>>}`;
      }[Exclude<keyof T, symbol>]
    : ''
) extends infer D
  ? Extract<D, string>
  : never;

/**
 * Selects the primitive-only values from a Record object
 */
type PrimitiveOnly<T, K extends string = string> = Exclude<T, Record<K, unknown>>;
/**
 * The deeply nested primitive-property values of an object.
 */
export type DeepValueOf<T extends Pojo> = PrimitiveOnly<NestedValue<T>>;

/**
 * Validates that the primitive-properties of an object are its own path.
 */
export type ValidateDeepEnumString<T extends Pojo> = IfEquals<DeepValueOf<T>, DeepKeyOf<T>>;

/**
 * An initializer function that returns a value of type T.
 */
export type InitializerUpdate<T> = (value: T) => T;
/**
 * An initializer value of function that returns a value of type T. This is the same type as the
 * first argument used by the `useState` hook.
 */
export type Initializer<T> = T | InitializerUpdate<T>;
// export type GetType = <S extends Pojo, P extends Path<S>>(obj: S, path: P) => PathValue<S, P>;
// export type SetType = <S extends Pojo, P extends PathString<S>>(
//   obj: S,
//   path: P,
//   value: Initializer<NestedValue<S>>,
// ) => S;

/**
 * Converts a readonly object into a mutable object
 */
export type Mutable<T> = {
  -readonly [Key in keyof T]: Mutable<T[Key]>;
};

/**
 * Converts a literal type to its more general, primitive type. This purposely does type widening.
 */
export type ToPrimitive<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T;
