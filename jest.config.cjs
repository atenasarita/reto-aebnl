module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.js', '**/__tests__/**/*.test.mjs', '**/?(*.)+(spec|test).js', '**/?(*.)+(spec|test).mjs'],
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'json', 'node'],
   roots: ['<rootDir>/client/src', '<rootDir>/__tests__'],
   moduleDirectories: ['node_modules', 'client/node_modules'],
};
