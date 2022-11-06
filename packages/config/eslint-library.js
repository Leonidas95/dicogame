const eslintBase = require('./.eslintrc');

module.exports = {
  ...eslintBase,
  env: {
    browser: true,
  },
  rules: {
    ...eslintBase.rules,
    '@typescript-eslint/explicit-function-return-type': 'error',
  },
};
