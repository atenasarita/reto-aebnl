module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.js', '**/__tests__/**/*.test.mjs', '**/?(*.)+(spec|test).js', '**/?(*.)+(spec|test).mjs'],
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'json', 'jsx', 'node'],
//   Ruta para correr en main
//    roots: ['<rootDir>/client/src', '<rootDir>/unitTests/__tests__'],

// Ruta para correr en local
   roots: ['<rootDir>/client/src', '<rootDir>/__tests__'],

   moduleDirectories: ['node_modules', 'client/node_modules'],
   transform:{
    '^.+\\.(js|jsx)$': 'babel-jest', 
   },
   transformIgnorePatterns: [
    '/node_modules/(?!(your-esm-package)/)',
    ],
    moduleNameMapper: {
    '^react$': '<rootDir>/client/node_modules/react',           // Para la prueba de useRegistroBeneficiario.test.mjs
    '^react/jsx-runtime$': '<rootDir>/client/node_modules/react/jsx-runtime',  // ← agrega esto
    '^react-dom$': '<rootDir>/client/node_modules/react-dom',                   // ← agrega esto
    '^react-dom/client$': '<rootDir>/client/node_modules/react-dom/client', 

    // PREregistro y HistorialPadres
    '\\.(css|less|module\\.css)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(png|jpg|jpeg|svg|gif)$': '<rootDir>/__mocks__/fileMock.js',

    '^.*\\/utils\\/config(\\.js)?$': '<rootDir>/__mocks__/configMock.js',
    '^.*\\/utils\\/espinaBifidaTypes(\\.js)?$': '<rootDir>/__mocks__/espinaBifidaMock.js',
    '^framer-motion$': '<rootDir>/__mocks__/framerMotionMock.js',
    '^lucide-react$': '<rootDir>/__mocks__/lucideReactMock.js',
    '^.*\\/utils\\/validator(\\.js)?$': '<rootDir>/__mocks__/validatorMock.js',
    '^.*\\/utils\\/dateTime(\\.js)?$': '<rootDir>/__mocks__/dateTimeMock.js',
  },
   coverageReporters: ['lcov', 'text'],
    coverageDirectory: 'coverage',
};
