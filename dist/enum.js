import { deepFreeze, flattenObjectPaths, getInitializer, isPlainObject } from './utils';
export const makeDeepEnumString = (obj) => {
    const result = deepFreeze(obj);
    return result;
};
/**
 * Gets the value at a given path in a deeply nested constant object.
 *
 * @param obj the object that contains the value to get
 * @param path tha path used to locate the value in this object
 * @returns the value stored at that path in obj
 */
export const get = (obj, path) => path.split('.').reduce((prev, key) => prev[key], obj);
const setRecurse = (obj, [prop, ...rest], value, { isMutable } = { isMutable: false }) => {
    const newObj = isMutable ? obj : (Array.isArray(obj) ? [...obj] : { ...obj });
    newObj[prop] = rest.length
        ? setRecurse(obj[prop], rest, value)
        : getInitializer(value, obj[prop]);
    return newObj;
};
/**
 * Immutably sets a deeply nested property in the given object.
 *
 * @param obj the object whose nested property to change
 * @param path tha path used to locate the value to change in this object
 * @param value the new value to be set
 * @returns a new object with its nested property changed.
 */
export const set = (obj, path, value, options = { isMutable: false }) => setRecurse(obj, path.split('.'), value, options);
const processProperties = (obj, previousPaths) => Object.keys(obj).reduce((a, c) => {
    a[c] = recurseProperties(obj[c], previousPaths ? [...previousPaths, c] : [c]);
    return a;
}, {});
function recurseProperties(currentObj, previousPaths) {
    // If is not pojo, return full path of property
    if (!isPlainObject(currentObj))
        return previousPaths.join('.');
    // If pojo, recurse through each key of the pojo until each property has a path
    return processProperties(currentObj, previousPaths);
}
export const makePathEnum = (obj) => deepFreeze(processProperties(obj));
export const getter = (obj) => (path) => path.split('.').reduce((prev, key) => prev[key], obj);
export const getDeepPaths = (obj) => Object.values(flattenObjectPaths(obj, [], []));
export const getDeepValues = (obj) => getDeepPaths(obj).reduce((accum, current) => [...accum, get(obj, current)], []);
export const getDeepKeyValues = (obj) => getDeepPaths(obj).reduce((accum, current) => ({ ...accum, [current]: get(obj, current) }), {});
export const flatten = getDeepKeyValues;
