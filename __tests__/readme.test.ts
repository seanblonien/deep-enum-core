import {createDeepEnum, createGet, DeepEnumType, get, set, setMutable} from 'deep-enum-core';

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

  it('should walk the parrot with type-safety', () => {
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

  const USER_FORM_ENUM = createDeepEnum(userForm);

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
