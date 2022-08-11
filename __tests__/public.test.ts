import {
  createDeepEnum,
  createDeepEnumFullMutable,
  createDeepEnumWithGet,
  createDeepGet,
  createGet,
  createSet,
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
};

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

  const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
  it('should create the deep enum and change a value with a setter mutably', () => {
    const animalCopy = deepCopy(Animal);
    const animalEnum = createDeepEnum(animalCopy);
    const set = createSet(animalCopy, {isMutable: true});
    set(animalEnum.Mammal.Cat.Persian, 'new Persian value mutable');

    const actual = animalCopy.Mammal.Cat.Persian;
    const expected = 'new Persian value mutable';

    expect(actual).toEqual(expected);
  });
  it('should create the deep enum and change a value with a setter immutably', () => {
    const animalEnum = createDeepEnum(Animal);
    const set = createSet(Animal);
    const newAnimalCopy = set(animalEnum.Mammal.Cat.Persian, 'new Persian value immutable');

    const actual = newAnimalCopy.Mammal.Cat.Persian;
    const expected = 'new Persian value immutable';

    expect(actual).toEqual(expected);
  });
  it('should create a full deep enum with its getter and setter', () => {
    const animalCopy = deepCopy(Animal);
    const [animalEnum, get, set] = createDeepEnumFullMutable(animalCopy);

    set(animalEnum.Mammal.Cat.Persian, 'new Persian value full');
    const actual = get(animalEnum.Mammal.Cat.Persian);
    const expected = 'new Persian value full';

    expect(actual).toEqual(expected);
  });
  it('should create a full deep enum with its getter and setter', () => {
    const animalCopy = deepCopy(Animal);
    const [animalEnum, get, set] = createDeepEnumFullMutable(animalCopy);

    set(animalEnum.Mammal.Cat.Persian, 'new Persian value full');
    const actual = get(animalEnum.Mammal.Cat.Persian);
    const expected = 'new Persian value full';

    expect(actual).toEqual(expected);
  });
});
