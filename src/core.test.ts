import {
  get,
  getDeepKeyValues,
  getDeepPaths,
  getDeepValues,
  createGet,
  sealDeepEnum,
  createDeepEnum,
  createDeepGet,
  createDeepEnumWithGet,
  setImmutable,
  setMutable,
} from '@core';
import {DeepValueOf, DeepKeyOf, IfEquals} from '@types';

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
      isCold: false,
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
  it('should seal a deep-enum object', () => {
    const cmsIdsEnum = sealDeepEnum(cmsIds);

    expect(cmsIdsEnum.page1.title).toBe('page1.title');
    expect(cmsIdsEnum.page1.header).toBe('page1.header');
    expect(cmsIdsEnum.page2.title).toBe('page2.title');
    expect(cmsIdsEnum.page3.title).toBe('page3.title');
    expect(cmsIdsEnum.page3.subpage.title).toBe('page3.subpage.title');
    expect(cmsIdsEnum.page3.subpage.content).toBe('page3.subpage.content');
  });
  it('should throw an error if you modify a sealed deep-enum', () => {
    const cmsIdsEnum = sealDeepEnum(cmsIds);

    expect(() => {
      // @ts-expect-error ensuring readonly
      cmsIdsEnum.page1.header = 'value';
    }).toThrow();
  });
  it('should create two equivalent deep-enum objects with an already defined deep-enum object', () => {
    const deepEnum1 = sealDeepEnum(cmsIds);
    const deepEnum2 = createDeepEnum(cmsIds);

    expect(deepEnum1).toEqual(deepEnum2);
  });
  it('should convert an object with arbitrary values to an deep-enum object', () => {
    const landmarkEnum = createDeepEnum(landmark);

    expect(landmarkEnum.name).toBe('name');
    expect(landmarkEnum.location.type).toBe('location.type');
    expect(landmarkEnum.location.properties.city).toBe('location.properties.city');
    expect(landmarkEnum.location.properties.isOpen).toBe('location.properties.isOpen');
    expect(landmarkEnum.location.properties[1]).toBe('location.properties.1');
    expect(landmarkEnum.location.geometry.coordinates).toBe('location.geometry.coordinates');
    expect(landmarkEnum.history.opened).toBe('history.opened');
    expect(landmarkEnum.history.closed).toBe('history.closed');
    expect(landmarkEnum.history.length).toBe('history.length');
  });
  it('should be able to use the deep-enum to get values from the original object', () => {
    const landmarkEnum = createDeepEnum(landmark);

    // string
    expect(get(landmark, landmarkEnum.location.properties.city)).toBe('San Francisco');
    // number
    expect(get(landmark, landmarkEnum.location.properties['1'])).toBe(1);
    // boolean
    expect(get(landmark, landmarkEnum.location.properties.isOpen)).toBe(true);
    expect(get(landmark, landmarkEnum.location.properties.isCold)).toBe(false);
    // array
    expect(get(landmark, landmarkEnum.location.geometry.coordinates)).toEqual([-122.4804438, 37.8199328]);
    // undefined
    expect(get(landmark, landmarkEnum.history.opened)).toBe(null);
    // null
    expect(get(landmark, landmarkEnum.history.length)).toBe(BigInt(9007199254740991));
  });
  it('should create a getter and access the objects values the same', () => {
    const landmarkEnum = createDeepEnum(landmark);
    const getLandmark = createGet(landmark);

    // string
    expect(getLandmark(landmarkEnum.location.properties.city)).toBe('San Francisco');
    // number
    expect(getLandmark(landmarkEnum.location.properties['1'])).toBe(1);
    // boolean
    expect(getLandmark(landmarkEnum.location.properties.isOpen)).toBe(true);
    expect(getLandmark(landmarkEnum.location.properties.isCold)).toBe(false);
    // array
    expect(getLandmark(landmarkEnum.location.geometry.coordinates)).toEqual([-122.4804438, 37.8199328]);
    // undefined
    expect(getLandmark(landmarkEnum.history.opened)).toBe(null);
    // null
    expect(getLandmark(landmarkEnum.history.length)).toBe(BigInt(9007199254740991));
  });
  it('should create a deep getter and access the nested value properly', () => {
    const landmarkEnum = createDeepEnum(landmark);
    const getLandmarkCity = createDeepGet(landmark, landmarkEnum.location.properties.city);

    expect(getLandmarkCity()).toBe('San Francisco');
  });
  it('should create a "nested getter" as a new and allow accessing properties of the nested subpath', () => {
    const landmarkPropertiesEnum = createDeepEnum(landmark.location.properties);
    const getProperties = createGet(landmark.location.properties);

    expect(getProperties(landmarkPropertiesEnum.city)).toBe('San Francisco');
    expect(getProperties(landmarkPropertiesEnum[1])).toBe(1);
    expect(getProperties(landmarkPropertiesEnum.isOpen)).toBe(true);
    expect(getProperties(landmarkPropertiesEnum.isCold)).toBe(false);
  });
  it('should get thrown errors if accessing properties that do not exist on an object', () => {
    const landmarkEnum = createDeepEnum(landmark);
    const realPath = landmarkEnum.location.properties.city;
    const fakePath1 = 'fakePath.broken' as typeof realPath;
    const fakePath2 = 'fakePath.broken1.broken2.broken3' as typeof realPath;
    const fakePath3 = 'location.properties.city.fakePath.broken' as typeof realPath;
    expect(() => get(landmark, fakePath1)).toThrow();
    expect(() => get(landmark, fakePath2)).toThrow();
    expect(() => get(landmark, fakePath3)).toThrow();
  });
  it('should create a deep-enum with a getter', () => {
    const [landmarkEnum, getLandmark] = createDeepEnumWithGet(landmark);

    expect(getLandmark(landmarkEnum.location.properties.city)).toBe('San Francisco');
    expect(getLandmark(landmarkEnum.location.properties['1'])).toBe(1);
    expect(getLandmark(landmarkEnum.location.properties.isOpen)).toBe(true);
    expect(getLandmark(landmarkEnum.location.properties.isCold)).toBe(false);
    expect(getLandmark(landmarkEnum.location.geometry.coordinates)).toEqual([-122.4804438, 37.8199328]);
    expect(getLandmark(landmarkEnum.history.opened)).toBe(null);
    expect(getLandmark(landmarkEnum.history.length)).toBe(BigInt(9007199254740991));
  });
  it('should throw errors if the object made into a deep-enum has keys with dots in them', () => {
    const obj = {a: {'b.c.d': 'value'}} as const;
    const deepEnum = createDeepEnum(obj);

    // @ts-expect-error testing this throws an invalid property access error
    expect(() => get(obj, deepEnum.a.b.c.d)).toThrow();
  });
  it('should be able to set deeply nested values using the enum immutably', () => {
    const landmarkCopy = deepCopy(landmark);
    const landmarkEnum = createDeepEnum(landmarkCopy);

    const newLandmark = setImmutable(landmarkCopy, landmarkEnum.location.properties.city, 'Los Angeles');
    expect(get(newLandmark, landmarkEnum.location.properties.city)).toBe('Los Angeles');
  });
  it('should be able to set deeply nested values using the enum mutably', () => {
    const landmarkCopy = deepCopy(landmark);
    const landmarkEnum = createDeepEnum(landmarkCopy);

    setMutable(landmarkCopy, landmarkEnum.location.properties.city, 'Los Angeles');
    expect(get(landmarkCopy, landmarkEnum.location.properties.city)).toBe('Los Angeles');
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
      false,
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
      'location.properties.isCold': false,
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
