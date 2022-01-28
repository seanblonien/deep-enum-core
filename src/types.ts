export type Primitive = string | number | boolean | symbol | null | undefined;
// export type PojoKeys = string | number | symbol;

export type Pojo<K extends string = string, V = unknown> = Record<K, V>;

type DotIfNotEmpty<Prefix extends string, Suffix extends string> = Prefix extends ''
  ? `${Suffix}`
  : `${Prefix}.${Suffix}`;
export type DeepPaths<T, K extends keyof T = keyof T, P extends string = ''> = K extends keyof T
  ? {
      [K in Exclude<keyof T, symbol | number>]: T[K] extends Pojo
        ? DeepPaths<T[K], keyof T[K], DotIfNotEmpty<P, K>>
        : DotIfNotEmpty<P, K>;
    }
  : never;
export type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? T[K] extends ArrayLike<unknown>
      ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof unknown[]>>}`
      : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never;

type _Path<T> = PathImpl<T, keyof T> | keyof T;
export type Path<T> = _Path<T> extends string ? _Path<T> : never;

export type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

export type NestedKey<P extends Pojo> = Path<P>;

export type NestedValue<P extends Pojo> = PathValue<P, NestedKey<P>>;

/**
 * Checks if two types are equal. Will throw an error if the types are not equal.
 */
export type IfEquals<T, U, Y = unknown, N = never> = (<G>() => G extends T ? 1 : 2) extends <
  G,
>() => G extends U ? 1 : 2
  ? Y
  : N;

export type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;
export type DeepKeyOf<T> = (
  [T] extends [never]
    ? ''
    : T extends Record<string, unknown>
    ? {
        [K in Exclude<keyof T, symbol>]: `${K}${undefined extends T[K] ? '?' : ''}${DotPrefix<
          DeepKeyOf<T[K]>
        >}`;
      }[Exclude<keyof T, symbol>]
    : ''
) extends infer D
  ? Extract<D, string>
  : never;

/**
 * Selects the string-only values from a Record object
 */
type StringOnly<T, K extends string = string> = Exclude<T, Record<K, unknown>>;

type DeepEnumStringKeys<T extends Pojo> = StringOnly<NestedValue<T>>;

export type ValidateDeepEnumString<T extends Pojo> = IfEquals<
  DeepEnumStringKeys<T>,
  DeepKeyOf<T>,
  true,
  false
>;

type GetNestedObj<
  O extends Pojo,
  K extends NestedKey<O>,
> = K extends `${infer First}.${infer Second}`
  ? O[First] extends Pojo
    ? Second extends NestedKey<O[First]>
      ? GetNestedObj<O[First], Second>
      : never
    : never
  : O[K];

export type GetNestedKeys<T extends Pojo, K extends NestedKey<T>> = DeepEnumStringKeys<
  // @ts-expect-error will resolve to 'never' if T or K is invalid
  GetNestedObj<T, K>
>;

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
