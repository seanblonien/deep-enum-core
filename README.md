# deep-enum-core ![NPM version](https://img.shields.io/npm/v/deep-enum-core?style=flat-square) ![NPM monthly downloads](https://img.shields.io/npm/dm/deep-enum-core?style=flat-square) ![Tests]()

Make deeply nested enums out of objects with a full type-safe interface.

```

 * A *deep-enum* object is one whose leaf-properties (properties that are primitives) are all strings
 * of the path of the property itself.
 *
 * e.g.
 *
 * ```
 * const deepEnum = {
 *   a: {
 *     b: {
 *       c: 'a.b.c',
 *     }
 *     d: 'a.d',
 *   }
 * } as const;
 * ```
 *
 * A deep-enum object only ever has strings keys (*without dots*) and string values (representing the paths).









 requires `as const`to ensures are treated as
 * literals instead of strings. For more, see
 * [TypeScript docs](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
 * to learn more about `as const` assertions.
```
