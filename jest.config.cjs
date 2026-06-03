module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.js', '**/__tests__/**/*.test.mjs', '**/?(*.)+(spec|test).js', '**/?(*.)+(spec|test).mjs'],
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'json', 'node'],
//   Ruta para correr en main
//    roots: ['<rootDir>/client/src', '<rootDir>/unitTests/__tests__'],

// Ruta para correr en local
   roots: ['<rootDir>/client/src', '<rootDir>/__tests__'],

   moduleDirectories: ['node_modules', 'client/node_modules'],
   transform:{
    '^.+\\.(js|jsx|mjs)$': 'babel-jest', 
   },
    moduleNameMapper: {
    '^react$': '<rootDir>/client/node_modules/react',           // Para la prueba de useRegistroBeneficiario.test.mjs
    '^react-dom/client$': '<rootDir>/client/node_modules/react-dom/client', 
    // PREregistro y HistorialPadres
    '\\.(css|less|module\\.css)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(png|jpg|jpeg|svg|gif)$': '<rootDir>/__mocks__/fileMock.js',

    '^.*\\/utils\\/config(\\.js)?$': '<rootDir>/__mocks__/configMock.js',
    '^.*\\/utils\\/espinaBifidaTypes(\\.js)?$': '<rootDir>/__mocks__/espinaBifidaMock.js',
  },
   coverageReporters: ['lcov', 'text'],
    coverageDirectory: 'coverage',
};
