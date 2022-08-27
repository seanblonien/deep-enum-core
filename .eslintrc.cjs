const prettierOptions = {
  endOfLine: 'lf',
  semi: true,
  singleQuote: true,
  bracketSpacing: false,
  jsxSingleQuote: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 100,
};

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: '.',
    sourceType: 'module',
    warnOnUnsupportedTypeScriptVersion: true,
  },
  env: {
    browser: true,
    es6: true,
  },
  plugins: [
    'import',
    'unused-imports',
    '@typescript-eslint',
    'sort-export-all',
    'sonarjs',
    'jsdoc',
  ],
  extends: [
    'airbnb-base',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:sort-export-all/recommended',
    'plugin:sonarjs/recommended',
    'plugin:prettier/recommended',
    'plugin:jsdoc/recommended',
  ],
  ignorePatterns: ['node_modules', 'dist'],
  settings: {
    jsdoc: {mode: 'typescript'},
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/extensions': ['.js', '.ts', '.tsx'],
    'import/resolver': {
      node: {extensions: ['.js', '.ts', '.tsx', '.json']},
      typescript: {project: ['./tsconfig.json']},
    },
  },
  reportUnusedDisableDirectives: true,
  rules: {
    // other
    'max-len': ['warn', {code: 100, comments: 120}],
    'max-lines-per-function': ['error', 100],
    'require-await': 'off',
    'object-property-newline': ['error', {allowAllPropertiesOnSameLine: true}],
    'no-unused-vars': 'off', // use typescript rule instead
    'no-useless-constructor': 'off',
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',
    'no-debugger': 'warn',
    'no-shadow': 'off',
    'no-var': 'error',
    'no-nested-ternary': 'warn',
    'arrow-body-style': ['warn', 'as-needed'],
    'no-param-reassign': ['error', {ignorePropertyModificationsForRegex: ['a|accum|accumulator']}],
    // prettier
    'prettier/prettier': ['warn', prettierOptions],
    // TypeScript
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-explicit-any': ['error', {fixToUnknown: true}],
    // '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-use-before-define': ['warn', {functions: false}],
    '@typescript-eslint/require-await': 'warn',
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          String: {
            message: 'Use `string` instead',
            fixWith: 'string',
          },
          Object: {
            message: 'Use `Pojo` instead',
            fixWith: 'Pojo',
          },
          object: {
            message: 'Use `Pojo` instead',
            fixWith: 'Pojo',
          },
        },
      },
    ],
    // import
    // 'import/namespace': 'off',
    'import/newline-after-import': 'warn',
    'import/no-cycle': [
      'error',
      {
        maxDepth: 1,
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/order': [
      'warn',
      {'newlines-between': 'never', alphabetize: {order: 'asc', caseInsensitive: true}},
    ],
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'error',
    // unused-import
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      {vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_'},
    ],
    // jsdoc
    'jsdoc/require-param-type': 'off',
    'jsdoc/require-param': ['warn', {enableRestElementFixer: false, checkDestructured: false}],
    'jsdoc/check-param-names': ['warn', {checkDestructured: false}],
    'jsdoc/require-returns-type': 'off',
    'jsdoc/require-jsdoc': ['warn', {publicOnly: true, require: {ArrowFunctionExpression: true}}],
  },
  overrides: [
    {
      files: ['**/*.test.ts'],
      env: {
        jest: true,
      },
      rules: {
        'import/no-extraneous-dependencies': ['error', {devDependencies: true}],
        'unused-imports/no-unused-vars': 'off',
        'max-len': 'off',
        'no-console': 'off',
        'prettier/prettier': ['warn', {...prettierOptions, printWidth: 120}],
        'max-lines-per-function': 'off',
        'sonarjs/no-duplicate-string': 'off',
      },
    },
    {
      files: ['scripts/*.ts'],
      rules: {
        'import/no-extraneous-dependencies': ['error', {devDependencies: true}],
        'unused-imports/no-unused-vars': 'off',
        'max-len': 'off',
        'no-console': 'off',
        'prettier/prettier': ['warn', {...prettierOptions, printWidth: 120}],
      },
    },
  ],
};
