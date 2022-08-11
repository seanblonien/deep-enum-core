import {createDeepEnum, DeepEnumType} from 'deep-enum-core';

const Animal = {
  Bird: {
    Parrot: 1,
    Penguin: 2,
  },
  Mammal: {
    Dog: 3,
    Cat: 4,
  },
};

const AnimalEnum = createDeepEnum(Animal);
type AnimalType = DeepEnumType<typeof AnimalEnum>;
function move(animal: AnimalType) {
  if (animal === AnimalEnum.Bird.Parrot) {
    return 'Parrot is flying';
  }
  if (animal === AnimalEnum.Bird.Penguin) {
    return 'Penguin is waddling';
  }
  if (animal === AnimalEnum.Mammal.Dog) {
    return 'Dog is walking';
  }
  if (animal === AnimalEnum.Mammal.Cat) {
    return 'Cat is pacing';
  }
  throw new Error('Unknown animal');
}

describe('testing type-safety of examples given in the readme', () => {
  it('should walk the parrot with type-safety', () => {
    const actual = move(AnimalEnum.Bird.Parrot);
    const expected = 'Parrot is flying';

    expect(actual).toBe(expected);
  });
});
