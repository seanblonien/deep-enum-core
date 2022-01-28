import { Initializer, Pojo } from './types';
export declare const isPlainObject: (obj: unknown) => unknown;
export declare function deepFreeze<T extends Pojo>(obj: T): T;
export declare const getInitializer: <T>(value: Initializer<T>, previousValue: T) => T;
