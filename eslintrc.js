module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'airbnb-typescript/base',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'react/destructuring-assignment': 'off',
    'react/jsx-filename-extension': 'off',
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    'class-methods-use-this': 'off',
    'no-prototype-builtins': 'off',
    'no-restricted-syntax': 'off',
    'no-underscore-dangle': 'off',
    'import/no-cycle': 'off',
    'guard-for-in': 'off',
    'no-plusplus': 'off',
    'no-use-before-define': [
      'error',
      { functions: false, classes: true, variables: true },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      { allowExpressions: true, allowTypedFunctionExpressions: true },
    ],
    '@typescript-eslint/no-use-before-define': [
      'error',
      { functions: false, classes: true, variables: true, typedefs: true },
    ],
    'import/order': [
      'error',
      {
        groups: [],
        'newlines-between': 'never',
      },
    ],
  },
};
