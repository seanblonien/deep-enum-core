<!-- markdownlint-disable MD028 -->
<!-- markdownlint-disable MD051 -->
<!-- markdownlint-disable MD033 -->

# deep-enum-core [![NPM version](https://img.shields.io/npm/v/deep-enum-core?style=flat)](https://www.npmjs.com/package/deep-enum-core) [![NPM monthly downloads](https://img.shields.io/npm/dm/deep-enum-core?style=flat)](](https://www.npmjs.com/package/deep-enum-core)) [![coverage](https://codecov.io/gh/seanblonien/deep-enum-core/branch/main/graph/badge.svg?token=LVQ9Y5H2WH)](https://codecov.io/gh/seanblonien/deep-enum-core) [![License](https://img.shields.io:/npm/l/deep-enum-core)](LICENSE)

> Make a deeply nested **enum of constant values** that provides type-safety for those constants

> OR, make a deeply nested enum **from an object's interface** to provide full type-safety for getting/setting those nested properties on that interface

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Motivation](#motivation)
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
  <summary><i>deep-enum constant usage</i></summary>

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

// ✅ You are now moving north
move(DirectionsEnum.Cardinal.N);

// ✅ You are now moving southeast
move(DirectionsEnum.Cardinal.SE);

// ❌ Argument of type '"invalid"' is not assignable to parameter of type
//    '"north" | "east" | "south" | "west" | "northeast" | "southwest" |
//    "southeast" | "northwest"'.
move('invalid');                  
```

</details>

**NOTE:** the object *must* have the TypeScript `const` keyword to indicate that the property values are string literals and not just strings ([read more why in TS docs](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-inference)).

### **Deep-Enum Interface**

But sometimes, you don't really need to store a specific value for an enum, you just want the type-safety and explicit nature of the enum. In this case, you can create a deep-enum interface that **ignores the enum values**, and **creates new, unique enum values for you** like so:

<details>
  <summary><i>deep-enum interface (constant) usage</i></summary>

```ts
// AnimalEnum.ts
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

// NOTE: the values are "ignored" and "don't matter" in this use-case (by choice)
// because the enum object generates new values to represent each constant. 
// If you *just want type-safety* for deeply nested enum constants, you shouldn't
// have to worry about the values. See the previous section if you do care about
// the values.
export const AnimalEnum = createDeepEnumInterface(Animal);
export type AnimalType = DeepEnumType<typeof AnimalEnum>;

// move.ts
function move(animal: AnimalType) {
  if (animal === AnimalEnum.Mammal.Dog) {
    // ...
  }
}

// move-usage.ts

 // ✅
move(AnimalEnum.Mammal.Dog);

// ❌ Argument of type '0' is not assignable to parameter of type
//    '"Bird.Parrot" | "Bird.Penguin" | "Mammal.Dog" | "Mammal.Cat"'
move(0);                     
```

</details>

**Explanation:** This simply creates an object where the primitive "leaf" properties are assigned their path. And with each leaf property assigned their path, the object can be used as a type-safe index to any object with the same interface (including itself). So, this allows us to use the enum for what enums are used for -- indexing into an object for typesafety. (See [`createDeepEnumInterface` API](#createdeepenuminterfaceobj-postfixidentifier) for more about its limitations.)

#### **Deep-Enum Interface as an Accessor**

A deep-enum interface provides you with a type-safe index to any object with the same interface. This means we can use it to get/set (read/write) to deeply nested properties of objects using the enum as the interface (abstract from the object that is being changed). All you need is the deep-enum interface to specify which property/path you want to update on a given object of that same interface.

<details>
  <summary><i>deep-enum interface (accessor) usage</i></summary>

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
- This simply creates an object where the primitive "leaf" properties are assigned their path. And with each leaf property assigned their path, the object can be used as a type-safe index to any object with the same interface (including itself). So, this allows us to use the enum for what enums are used for -- indexing into an object for typesafety.
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


          // ✔ The fix ✔
          // Use the `postfixIdentifier` param to guarantee uniqueness
          const AnimalEnum = createDeepEnumInterface(Animal, '123');
          // ...the rest stays the same

          // ❌
          // Argument of type '"Mammal.Dog"' is not assignable to parameter of type
          // '"Bird.Parrot123" | "Bird.Penguin123" | "Mammal.Dog123" | "Mammal.Cat123"'.
          move('Mammal.Dog');

          // ✅
          move(AnimalEnum.Mammal.Dog);
          AnimalEnum.Mammal.Dog === "Mammal.Dog123" // true
      ```
      <!-- markdownlint-enable MD031 -->
    - **NOTE**: you don't need to always use the `postfixIdentifier` param. You can just add it, see if there are type errors, and remove it. No need to keep it in the code (unless you have other purposes for it).
- **Returns**
  - the deep-enum object which holds the paths that can be used to index into the same interface

</details>

## Motivation Deep Dive

The main reason to use enums is to have stricter type-safety for a set of related constants, while also conveying the semantics of those constants.

Let's take a look at standard TypeScript enums:

```ts
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

function move(direction: Direction) {
  // ...
}
```

This `Direction` enum defines 4 constants (internally represented as `0`, `1`, `2`, and `3`) that relate to eachother, and we can see that being used semantically in a function `move` that takes in a `Direction` parameter.

This is a great interface because we can access the semantically meaningful constant without worrying about what that constant actually is at runtime, allowing us to simply do `move(Direction.Up)` in code, and avoid doing things like `move(0)`.

...but, *what if your constants are hierarchical or deeply nested?*

### Deep-Enums

A **deep-enum** is an object that defines constants in a semantically meaningful way that provides type-safety, like a regular TypeScript enum, while *also allowing said constants to be deeply nested*, which is something you **cannot** do with a regular TypeScript enum.

In an *ideal world*, if this was native to TypeScript, it could look something like this:

```ts
// CHANGE TO DIRECTIONS EXAMPLE
enum Animal {
  Bird: {
    Parrot,
    Penguin
  },
  Mammal: {
    Dog,
    Cat
  },
}
```

However, since this is not the case, we have to use standard TypeScript object interfaces to define a deep-enum like this one:

```ts
const Animal = {
  Bird: {
    Parrot: 'Bird.Parrot',
    Penguin: 'Bird.Penguin',
  },
  Mammal: {
    Dog: 'Mammal.Dog',
    Cat: 'Mammal.Cat',
  },
};

// or

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
```

Obviously this is less-than-ideal than the standard enum interface where values are implicitly defined, but because we are defining a static object literal, we *must* specify the property values of each enum value, making it much more verbose. We know the whole point of an enum is that the values should not matter, they just need to be internally unique. But, we need to assign the properties to something just because we need to create a valid object literal.

With standard enums, the object was flat, so you could always access every enum property simply using the dot or property accessor operator. And deep-enums are no different, we can still simply do `Animal.Bird.Parrot` and get an enum value.

Now that we have an object, how do we actually use it to enforce type-safety?

All we need to do is derive a few TypeScript helper interfaces and some helper functions and we can realize the full power of deep-enums.

### Deriving Type-Safe Interfaces

Let's say we want a function with this interface, using the above `Animal` object

```ts
function move(animal: Animal) {
  // ...
}
```

This exact interface doesn't work for a few reasons

- `Animal` is a value and can't be used as a type
- `typeof Animal` won't work either, because that's just the type of the Animal object as a whole, not the individual enums (`animal === Animal.Bird.Parrot` breaks)
- `keyof typeof Animal` won't work because that only gives us top-level keys, and not the nested enums.

What we really want is all valid enum keys as a type itself. So we could do something like this

```ts

type AnimalType = typeof Animal.Bird.Parrot |  typeof Animal.Bird.Penguin | typeof Animal.Mammal.Dog | typeof Animal.Mammal.Cat;
function move(animal: AnimalType) {
  if (animal === Animal.Bird.Parrot) {  
    // ...
  }
}
```

This works. But clearly, the second you start adding more to your enum, you have the manually duplicate type information which is an anti-pattern and should be avoided.

Luckily, since [TypeScript 4.1](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-rc/) when recursive conditional types and template literal types were introduced, we can use TypeScript to derive a type-safe interface for `Animal`. This library derives the type-safe interface of your object for you so we get both simplicitly and verbose type-safety at the same time.

See the [Deep-Enum Constants](#deep-enum-constants) section for this final code usage showing the `move` function with type-safety.

### The Trick

Quite simply, this library just converts a normal JavaScript object to a constant JavaScript object whose properties are replaced with each property's path as its value. So when you refer to an enum's nested property, you're actually just refferring to a string representation of the path of that property.

```ts
const obj = {a: {b: {c: 'value'}}};
const MY_ENUM = createDeepEnumInterface(obj);
console.log(MY_ENUM.a.b.c); // 'a.b.c'
```

There's really no magic to the enum object itself, *but* the value comes in when you use the enum object with the type-safe helper functions of this library for getting/setting deeply nested values in an object using the enum as an interface. This allows you to further decouple "how" objects are updated, and all you need is the "path" and "value" of a property to update.

## Limitations

Doesn't operate on arrays

## Benchmarks

## Related Projects
