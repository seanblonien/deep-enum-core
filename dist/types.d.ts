export declare type Primitive = string | number | boolean | symbol | null | undefined;
export declare type Pojo<K extends string = string, V = unknown> = Record<K, V>;
declare type DotIfNotEmpty<Prefix extends string, Suffix extends string> = Prefix extends '' ? `${Suffix}` : `${Prefix}.${Suffix}`;
export declare type DeepPaths<T, K extends keyof T = keyof T, P extends string = ''> = K extends keyof T ? {
    [K in Exclude<keyof T, symbol | number>]: T[K] extends Pojo ? DeepPaths<T[K], keyof T[K], DotIfNotEmpty<P, K>> : DotIfNotEmpty<P, K>;
} : never;
export declare type PathImpl<T, K extends keyof T> = K extends string ? T[K] extends Record<string, unknown> ? T[K] extends ArrayLike<unknown> ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof unknown[]>>}` : K | `${K}.${PathImpl<T[K], keyof T[K]>}` : K : never;
declare type _Path<T> = PathImpl<T, keyof T> | keyof T;
export declare type Path<T> = _Path<T> extends string ? _Path<T> : never;
export declare type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}` ? K extends keyof T ? Rest extends Path<T[K]> ? PathValue<T[K], Rest> : never : never : P extends keyof T ? T[P] : never;
export declare type NestedKey<P extends Pojo> = Path<P>;
export declare type NestedValue<P extends Pojo> = PathValue<P, NestedKey<P>>;
export declare type IfEquals<T, U, Y = unknown, N = never> = (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2 ? Y : N;
export declare type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;
export declare type DeepKeyOf<T> = ([
    T
] extends [never] ? '' : T extends Record<string, unknown> ? {
    [K in Exclude<keyof T, symbol>]: `${K}${undefined extends T[K] ? '?' : ''}${DotPrefix<DeepKeyOf<T[K]>>}`;
}[Exclude<keyof T, symbol>] : '') extends infer D ? Extract<D, string> : never;
declare type StringOnly<T, K extends string = string> = Exclude<T, Record<K, unknown>>;
declare type DeepEnumStringKeys<T extends Pojo> = StringOnly<NestedValue<T>>;
export declare type ValidateDeepEnumString<T extends Pojo> = IfEquals<DeepEnumStringKeys<T>, DeepKeyOf<T>, true, false>;
declare type GetNestedObj<O extends Pojo, K extends NestedKey<O>> = K extends `${infer First}.${infer Second}` ? O[First] extends Pojo ? Second extends NestedKey<O[First]> ? GetNestedObj<O[First], Second> : never : never : O[K];
export declare type GetNestedKeys<T extends Pojo, K extends NestedKey<T>> = DeepEnumStringKeys<GetNestedObj<T, K>>;
export declare type InitializerUpdate<T> = (value: T) => T;
export declare type Initializer<T> = T | InitializerUpdate<T>;
export {};
