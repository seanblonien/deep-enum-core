import {
  createDeepEnum,
  createDeepEnumWithGet,
  createDeepGet,
  createGet,
  getDeepKeyValues,
  getDeepPaths,
  getDeepValues,
} from 'deep-enum-core';

const Animal = {
  Bird: {
    Parrot: 'hidden Parrot value',
    Penguin: 'hidden Penguin value',
  },
  Mammal: {
    Dog: 'hidden Dog value',
    Cat: {
      Siamese: 'hidden Siamese value',
      Bengal: 'hidden Bengal value',
      Persian: 'hidden Persian value',
    },
  },
} as const;

describe('tests the exported primitive functions for the library', () => {
  it('should create a deep enum with expected values', () => {
    const actual = createDeepEnum(Animal);
    const expected = {
      Bird: {
        Parrot: 'Bird.Parrot',
        Penguin: 'Bird.Penguin',
      },
      Mammal: {
        Dog: 'Mammal.Dog',
        Cat: {
          Siamese: 'Mammal.Cat.Siamese',
          Bengal: 'Mammal.Cat.Bengal',
          Persian: 'Mammal.Cat.Persian',
        },
      },
    };

    expect(actual).toEqual(expected);
  });
  it('should get the deep paths/keys from Animals', () => {
    const actual = getDeepPaths(Animal);
    const expected = [
      'Bird.Parrot',
      'Bird.Penguin',
      'Mammal.Dog',
      'Mammal.Cat.Siamese',
      'Mammal.Cat.Bengal',
      'Mammal.Cat.Persian',
    ] as const;

    expect(actual).toEqual(expected);
  });
  it('should get the deep path values from Animals', () => {
    const actual = getDeepValues(Animal);
    const expected = [
      'hidden Parrot value',
      'hidden Penguin value',
      'hidden Dog value',
      'hidden Siamese value',
      'hidden Bengal value',
      'hidden Persian value',
    ];

    expect(actual).toEqual(expected);
  });
  it('should get the deep key/value pairs from Animals', () => {
    const actual = getDeepKeyValues(Animal);
    const expected = {
      'Bird.Parrot': 'hidden Parrot value',
      'Bird.Penguin': 'hidden Penguin value',
      'Mammal.Dog': 'hidden Dog value',
      'Mammal.Cat.Siamese': 'hidden Siamese value',
      'Mammal.Cat.Bengal': 'hidden Bengal value',
      'Mammal.Cat.Persian': 'hidden Persian value',
    };

    expect(actual).toEqual(expected);
  });
});

describe('tests the exported advanced functions for the library', () => {
  it('should create the deep and use a valid getter', () => {
    const animalEnum = createDeepEnum(Animal);
    const get = createGet(Animal);

    const actual = get(animalEnum.Mammal.Cat.Persian);
    const expected = 'hidden Persian value';

    expect(actual).toEqual(expected);
  });
  it('should create the deep and use a valid getter', () => {
    const animalEnum = createDeepEnum(Animal);
    const get = createDeepGet(Animal, animalEnum.Mammal.Cat.Persian);

    const actual = get();
    const expected = 'hidden Persian value';

    expect(actual).toEqual(expected);
  });
  it('should create the deep enum with a valid getter', () => {
    const [animalEnum, get] = createDeepEnumWithGet(Animal);

    const actual = get(animalEnum.Mammal.Cat.Persian);
    const expected = 'hidden Persian value';

    expect(actual).toEqual(expected);
  });
});
