/* eslint-disable max-lines-per-function */
/* eslint-disable sonarjs/no-duplicate-string */
import {get, getDeepKeyValues, getDeepPaths, getDeepValues, getter, makeDeepEnumString, makePathEnum, set} from '../src/enum';
import {DeepValueOf, DeepKeyOf, IfEquals} from '../src/types';

const cmsIds = {
  page1: {
    title: 'page1.title',
    header: 'page1.header',
  },
  page2: {
    title: 'page2.title',
  },
  page3: {
    title: 'page3.title',
    subpage: {
      title: 'page3.subpage.title',
      content: 'page3.subpage.content',
    },
  },
} as const;

const landmark = {
  name: 'Golden Gate Bridge',
  location: {
    type: 'Feature',
    properties: {
      city: 'San Francisco',
      isOpen: true,
      isCold: true,
      '1': 1,
    },
    geometry: {
      coordinates: [-122.4804438, 37.8199328],
    },
  },
  history: {
    opened: null,
    closed: undefined,
    length: BigInt(9007199254740991),
  },
} as const;

const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// eslint-disable-next-line func-names
(BigInt.prototype as unknown as {toJSON: () => string}).toJSON = function () {
  return this.toString();
};

describe('testing enum functions', () => {
  it('should make a deep enum string', () => {
    const deepEnum = makeDeepEnumString(cmsIds);

    expect(deepEnum.page1.title).toBe('page1.title');
    expect(deepEnum.page1.header).toBe('page1.header');
    expect(deepEnum.page2.title).toBe('page2.title');
    expect(deepEnum.page3.title).toBe('page3.title');
    expect(deepEnum.page3.subpage.title).toBe('page3.subpage.title');
    expect(deepEnum.page3.subpage.content).toBe('page3.subpage.content');
  });
  it('should not allow you to modify properties', () => {
    const deepEnum = makeDeepEnumString(cmsIds);

    expect(() => {
      // @ts-expect-error ensuring readonly
      deepEnum.page1.header = 'value';
    }).toThrow();
  });
  it('should convert an object with arbitrary values to an deep enum equivalent', () => {
    const pathEnum = makePathEnum(landmark);

    expect(pathEnum.name).toBe('name');
    expect(pathEnum.location.type).toBe('location.type');
    expect(pathEnum.location.properties.city).toBe('location.properties.city');
    expect(pathEnum.location.properties.isOpen).toBe('location.properties.isOpen');
    expect(pathEnum.location.properties[1]).toBe('location.properties.1');
    expect(pathEnum.location.geometry.coordinates).toBe('location.geometry.coordinates');
    expect(pathEnum.history.opened).toBe('history.opened');
    expect(pathEnum.history.closed).toBe('history.closed');
    expect(pathEnum.history.length).toBe('history.length');
  });
  it('should be able to use the deep enum to get values from the original object', () => {
    const pathEnum = makePathEnum(landmark);

    // string
    expect(get(landmark, pathEnum.location.properties.city)).toBe('San Francisco');
    // number
    expect(get(landmark, pathEnum.location.properties['1'])).toBe(1);
    // boolean
    expect(get(landmark, pathEnum.location.properties.isOpen)).toBe(true);
    // array
    expect(get(landmark, pathEnum.location.geometry.coordinates)).toEqual([-122.4804438, 37.8199328]);
    // undefined
    expect(get(landmark, pathEnum.history.opened)).toBe(null);
    // null
    expect(get(landmark, pathEnum.history.length)).toBe(BigInt(9007199254740991));
  });
  it('should be able to get an enum getter', () => {
    const pathEnum = makePathEnum(landmark);
    const pathEnumGetter = getter(landmark);

    // string
    expect(pathEnumGetter(pathEnum.location.properties.city)).toBe('San Francisco');
    // number
    expect(pathEnumGetter(pathEnum.location.properties['1'])).toBe(1);
    // boolean
    expect(pathEnumGetter(pathEnum.location.properties.isOpen)).toBe(true);
    // array
    expect(pathEnumGetter(pathEnum.location.geometry.coordinates)).toEqual([-122.4804438, 37.8199328]);
    // undefined
    expect(pathEnumGetter(pathEnum.history.opened)).toBe(null);
    // null
    expect(pathEnumGetter(pathEnum.history.length)).toBe(BigInt(9007199254740991));
  });
  it('should be able to set deeply nested values using the enum immutably', () => {
    const landmarkCopy = deepCopy(landmark);
    const pathEnum = makePathEnum(landmarkCopy);

    const newLandmarkCopy = set(landmarkCopy, pathEnum.location.properties.city, 'Los Angeles');
    expect(get(newLandmarkCopy, pathEnum.location.properties.city)).toBe('Los Angeles');
  });
  it('should be able to set deeply nested values using the enum mutably', () => {
    const landmarkCopy = deepCopy(landmark);
    const pathEnum = makePathEnum(landmarkCopy);

    set(landmarkCopy, pathEnum.location.properties.city, 'Los Angeles', {isMutable: true});
    expect(get(landmarkCopy, pathEnum.location.properties.city)).toBe('Los Angeles');
  });

  it('should be able to get the unique keys/paths from an object', () => {
    const paths = [
      'name',
      'location.type',
      'location.properties.city',
      'location.properties.isOpen',
      'location.properties.isCold',
      'location.properties.1',
      'location.geometry.coordinates',
      'history.opened',
      'history.closed',
      'history.length',
    ] as const;

    type actualPathsType = typeof paths[number];
    type expectedPathsType = DeepKeyOf<typeof landmark>;
    const _typecheck: IfEquals<actualPathsType, expectedPathsType> = true;

    const actualPaths = getDeepPaths(landmark).sort();
    const expectedPaths = [...paths].sort();
    expect(actualPaths).toEqual(expectedPaths);
  });

  it('should be able to get all of the deeply nested values from an object', () => {
    const values = [
      'Golden Gate Bridge',
      'Feature',
      'San Francisco',
      true,
      true,
      1,
      [-122.4804438, 37.8199328],
      null,
      undefined,
      BigInt(9007199254740991),
    ] as const;

    type actualValuesType = typeof values[number];
    type expectedValuesType = DeepValueOf<typeof landmark>;
    const _typecheck: IfEquals<actualValuesType, expectedValuesType> = true;

    const actualValues = getDeepValues(landmark).sort();
    const expectedValues = [...values].sort();
    expect(actualValues).toEqual(expectedValues);
  });

  it('should be able to get all of the deeply nested key/value pairs from an object', () => {
    const keyValues = {
      name: 'Golden Gate Bridge',
      'location.type': 'Feature',
      'location.properties.city': 'San Francisco',
      'location.properties.isOpen': true,
      'location.properties.isCold': true,
      'location.properties.1': 1,
      'location.geometry.coordinates': [-122.4804438, 37.8199328],
      'history.opened': null,
      'history.closed': undefined,
      'history.length': BigInt(9007199254740991),
    } as const;

    const actualKeyValues = getDeepKeyValues(landmark);
    const expectedValues = keyValues;
    expect(actualKeyValues).toEqual(expectedValues);
  });
});
