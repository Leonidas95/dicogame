module.exports = {
  ...require('config/eslint-nest'),
  parserOptions: {
    root: true,
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
