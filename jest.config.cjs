module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.js', '**/__tests__/**/*.test.mjs', '**/?(*.)+(spec|test).js', '**/?(*.)+(spec|test).mjs'],
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'json', 'node'],
//   Ruta para correr en main
   roots: ['<rootDir>/client/src', '<rootDir>/unitTests/__tests__'],

// Ruta para correr en local
//    roots: ['<rootDir>/client/src', '<rootDir>/__tests__'],

   moduleDirectories: ['node_modules', 'client/node_modules'],
    moduleNameMapper: {
    '^react$': '<rootDir>/client/node_modules/react',           // Para la prueba de useRegistroBeneficiario.test.mjs
    '^react-dom/client$': '<rootDir>/client/node_modules/react-dom/client', 
  },
   coverageReporters: ['lcov', 'text'],
    coverageDirectory: 'coverage',
};
