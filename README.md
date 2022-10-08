<!-- markdownlint-disable MD028 -->
<!-- markdownlint-disable MD051 -->
<!-- markdownlint-disable MD033 -->

# deep-enum-core [![NPM version](https://img.shields.io/npm/v/deep-enum-core?style=flat)](https://www.npmjs.com/package/deep-enum-core) [![npm bundle size](https://img.shields.io/bundlephobia/minzip/deep-enum-core)](https://bundlephobia.com/package/deep-enum-core) [![coverage](https://codecov.io/gh/seanblonien/deep-enum-core/branch/main/graph/badge.svg?token=LVQ9Y5H2WH)](https://codecov.io/gh/seanblonien/deep-enum-core) ![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability-percentage/seanblonien/deep-enum-core) [![License](https://img.shields.io:/npm/l/deep-enum-core)](LICENSE)

> Make a deeply nested **enum of constant values** that provides type-safety for those constants

> OR, make a deeply nested enum from an *object's interface* to provide **full type-safety for accessing those properties** on that interface

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Limitations](#limitations)
- [Benchmarks](#benchmarks)
- [Related Projects](#related-projects)

## Installation

```sh
npm install deep-enum-core
```

## Usage

There are two primary use cases for this library:

### **Deep-Enum Constant**

A deep-enum constant is a constant, readonly object that is used to semantically group constants together in a nested fashion (like a [regular TS `enum`](https://www.typescriptlang.org/docs/handbook/enums.html), but nested). The main use case for this is, like with normal enums, 1) re-use and 2) type-safety.

Here is an example of creating a deep-enum constant for storing specifc values (i.e. the value of the enum needs to be a *specific* string or number):

<details>
  <summary><i>deep-enum constant usage ⬇</i></summary>

```ts
// (excluding import statements)
// DirectionsEnum.ts
export const DirectionsEnum = deepEnumConstant({
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

export type DirectionsType = DeepEnumConstantType<typeof DirectionsEnum>;

// move.ts
function move(direction: DirectionsType) {
    return `You are now moving ${direction}`;
}

// move-usage.ts

move(DirectionsEnum.Cardinal.N);  // ✅ You are now moving north
move(DirectionsEnum.Cardinal.SE); // ✅ You are now moving southeast
move('invalid');                  // ❌ Argument of type '"invalid"' is not assignable to parameter of type '"north" | "east" | "south" | "west" | "northeast" | "southwest" | "southeast" | "northwest"'.   
```

</details>

**NOTE:** the object *must* have the TypeScript `const` keyword to indicate that the property values are string literals and not just strings ([read more why in TS docs](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-inference)).

### **Deep-Enum Interface**

But sometimes, you don't really need to store a specific value for an enum, you just want the type-safety and explicit nature of the enum. In this case, you can create a deep-enum interface that **ignores the enum values**, and **creates new, unique enum values for you** like so:

<details>
  <summary><i>deep-enum interface (constant) usage ⬇</i></summary>

```ts
// AnimalEnum.ts

// Note: the placeholder values can be anything, `0` was chosen because it's 
// short/makes sense as a default (`null`/`undefined` work too!)
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

// The values are "ignored" and "don't matter" in this use-case (by choice)
// because the enum object generates new values to represent each constant. 
// If you *just want type-safety* for deeply nested enum constants, you shouldn't
// have to worry about the values. See the previous section if you *do* care about
// the values.
export const AnimalEnum = createDeepEnumInterface(Animal);
export type AnimalType = DeepEnumType<typeof AnimalEnum>;

// Note: you shouldn't be using the `Animal` object directly anymore if you're using 
// the enum properly (doesn't need to be exported)

// move.ts
function move(animal: AnimalType) {
  if (animal === AnimalEnum.Mammal.Dog) {
    // ...
  }
}

// move-usage.ts
move(AnimalEnum.Mammal.Dog); // ✅
move(0);                     // ❌ Argument of type '0' is not assignable to parameter of type '"Bird.Parrot" | "Bird.Penguin" | "Mammal.Dog" | "Mammal.Cat"'                   
```

</details>

**Explanation:** This creates an object where the primitive "leaf" properties are assigned their path. And with each leaf property assigned their path (which is gauranteed to be internally unique), the object can be used as a type-safe index to any object with the same interface (including itself). So, this allows us to use the enum for what enums are used for -- indexing into an object for typesafety. (See [`createDeepEnumInterface` API](#createdeepenuminterfaceobj-postfixidentifier) for more about its limitations.)

#### **Deep-Enum Interface as an Accessor**

A deep-enum interface provides you with a type-safe index to any object with the same interface. This means we can use it to access (get/set, read/write) deeply nested properties of objects using the enum as the interface, abstract from the object that is being changed. All you need is the deep-enum interface to specify which property/path you want to update on a given object of that same interface.

<details>
  <summary><i>deep-enum interface (accessor) usage ⬇</i></summary>

```ts
// a TypeScript interface that is static that we want to make a deep-enum
// interace out of to update its nested properties
type UserForm = {
  user: {
    name: string;
    address: {
      line1: string;
    };
  };
};

// an object that we want to be able to update using the above interface
const userForm: UserForm = {
  user: {
    name: '',
    address: {
      line1: '',
    },
  },
};

// create a deep-enum object that can be used to type-safely reference
// paths of the above object
const USER_FORM_ENUM = createDeepEnumInterface(userForm);

// immutable object updates
const newUserForm = set(userForm, USER_FORM_ENUM.user.address.line1, '123 Main St immutable');
get(userFormObject, USER_FORM_ENUM.user.address.line1); // '123 Main St immutable'

// mutable object updates
setMutable(userForm, USER_FORM_ENUM.user.address.line1, '123 Main St mutable');
get(userForm, USER_FORM_ENUM.user.address.line1); // '123 Main St mutable'

```

</details>

Continue onto the [API](#api) to see the full list of the helper functions you can use to avoid some of this boiler plate and get re-use when doing get/set on an object using a deep-enum.

## API

<details>
  <summary><h3>Glossary of Terms:<h3></summary>

- **enum**: a group of related constants that share sematic meaning. its values are used to enforce more strict type-safety on variables and paramters
  - [TypeScript docs](https://www.typescriptlang.org/docs/handbook/enums.html#enums) define enums to "allow a developer to define a set of named constants. Using enums can make it easier to document intent, or create a set of distinct cases."
- **deep-enum**: like an enum, but the constants are nested
- **path** or **property**: a set of object keys that uniquely define a value (either another object or primitive value) within an object
  - e.g., `const obj = {a: {b: {c: 'value'}}};` has 3 paths/properties: `'a'`, `'a.b'`, and `'a.b.c'`
- **deep-enum path**: a path where the value is a primitive (not an object)
  - e.g., `const obj = {a: {b: {c: 'value'}}};` has 1 deep-enum path `'a.b.c'`
- **deep-enum value**: a deep-enum path's value
  - e.g., `const obj = {a: {b: {c: 'value'}}};` has 1 leaf value: `'value'`
- **leaf property**: a primitive value in a deeply nested object (no further nesting exists on the property)

</details>

<details>
  <summary><h3><code>createDeepEnumInterface(obj, postfixIdentifier)</code><h3></summary>

- Generates a deep-enum interface object from a regular object that can be used as an enum accessor to an object with the same interface.
- NOTE: this object ***is immutable, readonly, and can't be changed***, simply because **it is an enum**!
- This creates an object where the primitive "leaf" properties are assigned their path. And with each leaf property assigned their path (which is gauranteed to be internally unique), the object can be used as a type-safe index to any object with the same interface (including itself). So, this allows us to use the enum for what enums are used for -- indexing into an object for typesafety.
- **Params**
  - `obj`: the object to generate the deep-enum from, must be a plain object or record or key-value pair object
  - `postfixIdentifier` (optional): the value to append to the end of a path when generating the enum values
    - Use this to detect if you are properly using the deep enum object interface and not hard-coding the string literals/paths anywhere, e.g.
      <!-- markdownlint-disable MD031 -->
      ```ts
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

          function move(animal: AnimalType) { }

          // ⚠ NO TYPE ERROR! ⚠
          // This is because by `createDeepEnumInterface` converts the values
          // to the string literal path name, so this is technically valid
          // structural type-safety (this string literal is equal to the 
          // enum's same string literal).
          move('Mammal.Dog');
          AnimalEnum.Mammal.Dog === "Mammal.Dog" // true


          // ✔ The fix ✔
          // Use the `postfixIdentifier` param to guarantee uniqueness
          const AnimalEnum = createDeepEnumInterface(Animal, '123');
          // ...the rest stays the same

          move('Mammal.Dog');          // ❌ Argument of type '"Mammal.Dog"' is not assignable to parameter of type '"Bird.Parrot123" | "Bird.Penguin123" | "Mammal.Dog123" | "Mammal.Cat123"'.
          move(AnimalEnum.Mammal.Dog); // ✅
          AnimalEnum.Mammal.Dog === "Mammal.Dog"    // false
          AnimalEnum.Mammal.Dog === "Mammal.Dog123" // true
      ```
      <!-- markdownlint-enable MD031 -->
    - **NOTE**: you don't need to always use the `postfixIdentifier` param. You can just add it, see if there are type errors, and remove it. No need to keep it in the code (unless you find other purposes for it).
- **Returns**
  - the deep-enum object which holds the paths that can be used to index into the same interface

</details>

## Limitations

- Does not work with arrays.
  - This shouldn't be a problem for the deep-enum constant use case, but for the deep-enum interface use case, you just have to use the accessors to change the array as hole (no partial/deeply updates for arrays).

## Benchmarks

WIP

## Related Projects

I haven't found other projects related to this deep enum concept explicitly (let me know if you find something similar!), but I have found plenty related to deep property accessing

- [set-value](https://github.com/jonschlinkert/set-value)
- [get-value](https://github.com/jonschlinkert/get-value)
- [lodash.set](https://lodash.com/docs#set)
- [lodash.get](https://lodash.com/docs#set)
- [object-path-immutable](https://github.com/mariocasciaro/object-path-immutable)
- [object-path](https://github.com/mariocasciaro/object-path)
- [dot-prop](https://github.com/sindresorhus/dot-prop)
