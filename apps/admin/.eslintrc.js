module.exports = {
  ...require('config/eslint-vite'),
  parserOptions: {
    root: true,
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
