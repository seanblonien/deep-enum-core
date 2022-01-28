import { deepFreeze, getInitializer, isPlainObject } from './utils';
export const makeDeepEnumString = (obj) => {
    const result = deepFreeze(obj);
    return result;
};
export const get = (obj, path) => path.split('.').reduce((prev, key) => prev[key], obj);
const setRecurse = (obj, [prop, ...rest], value, { isMutable } = { isMutable: false }) => {
    const newObj = isMutable ? obj : (Array.isArray(obj) ? [...obj] : { ...obj });
    newObj[prop] = rest.length
        ? setRecurse(obj[prop], rest, value)
        : getInitializer(value, obj[prop]);
    return newObj;
};
export const set = (obj, path, value, options = { isMutable: false }) => setRecurse(obj, path.split('.'), value, options);
function processProperties(obj, previousPaths) {
    return Object.keys(obj).reduce((a, c) => {
        a[c] = recurseProperties(obj[c], previousPaths ? [...previousPaths, c] : [c]);
        return a;
    }, {});
}
function recurseProperties(currentObj, previousPaths) {
    if (!isPlainObject(currentObj))
        return previousPaths.join('.');
    return processProperties(currentObj, previousPaths);
}
export const makePathEnum = (obj) => deepFreeze(processProperties(obj));
export const getter = (obj) => (path) => path.split('.').reduce((prev, key) => prev[key], obj);
//# sourceMappingURL=enum.js.map