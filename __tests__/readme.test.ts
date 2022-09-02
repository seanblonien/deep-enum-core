import {
  createDeepEnumInterface,
  createGet,
  deepEnumConstant,
  DeepEnumConstantType,
  get,
  set,
  setMutable,
} from 'deep-enum-core';

describe('testing creation of a deep enum constant', () => {
  const DirectionsEnum = deepEnumConstant({
    Cardinal: {
      N: 'north',
      E: 'east',
      S: 'south',
      W: 'west',
    },
    Ordinal: {
      NE: 'northeast',
      SW: 'southwest',
      SE: 'southeast',
      NW: 'northwest',
    },
  } as const);
  type DirectionsType = DeepEnumConstantType<typeof DirectionsEnum>;
  function move(direction: DirectionsType) {
    return `You are now moving ${direction}`;
  }

  it('should walk north with type-safety', () => {
    const actual = move(DirectionsEnum.Cardinal.N);
    const expected = 'You are now moving north';

    expect(actual).toBe(expected);
  });

  it('should walk southeast with type-safety', () => {
    const actual = move(DirectionsEnum.Ordinal.SE);
    const expected = 'You are now moving southeast';

    expect(actual).toBe(expected);
  });

  it('should throw a TS error on the function', () => {
    // @ts-expect-error testing this throws an invalid property access error
    move('invalid');
  });
});

describe('testing type-safety of the Animal example in the readme', () => {
  const Animal = {
    Bird: {
      Parrot: 0,
      Penguin: 0,
    },
    Mammal: {
      Dog: 0,
      Cat: 0,
    },
  };

  const AnimalEnum = createDeepEnumInterface(Animal);
  type AnimalType = DeepEnumConstantType<typeof AnimalEnum>;
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

  it('should walk the dog with type-safety', () => {
    const actual = move(AnimalEnum.Mammal.Dog);
    const expected = 'Dog is walking';

    expect(actual).toBe(expected);
  });

  it('should throw a TS error and run-time error on the function', () => {
    // @ts-expect-error testing this throws an invalid property access error
    expect(() => move(0)).toThrow();
  });
});

describe('testing type-safety of the form example in the readmme', () => {
  type UserForm = {
    user: {
      name: string;
      address: {
        line1: string;
        line2?: string;
      };
    };
  };
  const userForm: UserForm = {
    user: {
      name: '',
      address: {
        line1: '',
      },
    },
  };

  const USER_FORM_ENUM = createDeepEnumInterface(userForm);

  it('should pass the usage example immutable', () => {
    // immutable object updates
    const newUserForm = set(userForm, USER_FORM_ENUM.user.address.line1, '123 Main St immutable');

    const expected = '123 Main St immutable';
    const actual = get(newUserForm, USER_FORM_ENUM.user.address.line1);

    expect(actual).toBe(expected);
  });

  it('should pass the usage example mutable', () => {
    // mutable object updates
    setMutable(userForm, USER_FORM_ENUM.user.address.line1, '123 Main St mutable');

    const expected = '123 Main St mutable';
    const actual = get(userForm, USER_FORM_ENUM.user.address.line1);

    expect(actual).toBe(expected);
  });

  it('should access a nested value that has mutably changed without set', () => {
    userForm.user.name = 'Jane';
    const get = createGet(userForm);

    const actual = get(USER_FORM_ENUM.user.name);
    const expected = 'Jane';

    expect(actual).toBe(expected);
  });

  it('should access a nested value that has immutably changed without set', () => {
    const updatedUserFormObject = {...userForm, user: {...userForm.user, name: 'John'}};
    const get = createGet(updatedUserFormObject);

    const actual = get(USER_FORM_ENUM.user.name);
    const expected = 'John';

    expect(actual).toBe(expected);
  });
});

describe('testing API interface example code', () => {
  const Animal = {
    Bird: {
      Parrot: 0,
      Penguin: 0,
    },
    Mammal: {
      Dog: 0,
      Cat: 0,
    },
  };

  it('should properly move the animal with happy path usage', () => {
    const AnimalEnum = createDeepEnumInterface(Animal);
    type AnimalType = DeepEnumConstantType<typeof AnimalEnum>;

    function move(animal: AnimalType) {
      return `${animal} type is moving`;
    }

    const expected = 'Mammal.Dog type is moving';
    const actual = move(AnimalEnum.Mammal.Dog);

    expect(actual).toBe(expected);
  });

  it('should not throw an error if a string literal is hard-coded to be same value as enum', () => {
    const AnimalEnum = createDeepEnumInterface(Animal);
    type AnimalType = DeepEnumConstantType<typeof AnimalEnum>;

    function move(animal: AnimalType) {
      return `${animal} type is moving`;
    }

    const expected = 'Mammal.Dog type is moving';
    const actual = move('Mammal.Dog');

    expect(actual).toBe(expected);
  });

  it('should properly move the uniquely identified animal', () => {
    const AnimalEnum = createDeepEnumInterface(Animal, '123');
    type AnimalType = DeepEnumConstantType<typeof AnimalEnum>;

    function move(animal: AnimalType) {
      return `${animal} type is moving`;
    }

    const expected = 'Mammal.Dog123 type is moving';
    const actual = move(AnimalEnum.Mammal.Dog);

    expect(actual).toBe(expected);
  });

  it('should throw an error if just the path, not the enum value, was used to move the dog', () => {
    const AnimalEnum = createDeepEnumInterface(Animal, '123');
    type AnimalType = DeepEnumConstantType<typeof AnimalEnum>;

    function move(animal: AnimalType) {
      return `${animal} type is moving`;
    }

    const expected = 'Mammal.Dog123 type is moving';
    // @ts-expect-error this error indicates you are not using the enum properly
    const actual = move('Mammal.Dog');

    expect(actual).not.toBe(expected);
  });
});
