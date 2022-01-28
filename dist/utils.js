export const isPlainObject = (obj) => obj && typeof obj === 'object' && Object.prototype === Object.getPrototypeOf(obj);
export function deepFreeze(obj) {
    Object.keys(obj).forEach(key => {
        const o = obj[key];
        if (o && typeof o === 'object' && !Object.isFrozen(o))
            deepFreeze(o);
    });
    return Object.freeze(obj);
}
export const getInitializer = (value, previousValue) => typeof value === 'function' ? value(previousValue) : value;
//# sourceMappingURL=utils.js.map