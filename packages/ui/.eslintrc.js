module.exports = {
  ...require('config/eslint-library'),
  parserOptions: {
    root: true,
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
