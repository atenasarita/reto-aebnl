module.exports = {
  testEnvironment: 'jsdom',
testMatch: [
  '**/__tests__/**/*.test.js',
  '**/__tests__/**/*.test.mjs',
  '**/__tests__/**/*.test.jsx',
  '**/__tests__/**/*.test.ts',

  '**/?(*.)+(spec|test).js',
  '**/?(*.)+(spec|test).mjs',
  '**/?(*.)+(spec|test).jsx',
  '**/?(*.)+(spec|test).ts',
],
  extensionsToTreatAsEsm: ['.ts'],

  moduleFileExtensions: ['js', 'mjs', 'cjs', 'json', 'jsx', 'node', 'ts'],
//   Ruta para correr en main
//    roots: ['<rootDir>/client/src', '<rootDir>/unitTests/__tests__'],

// Ruta para correr en local
   roots: ['<rootDir>/client/src','<rootDir>/server/src', '<rootDir>/__tests__'], 

   moduleDirectories: ['node_modules', 'client/node_modules'],
   transform:{
    '^.+\\.(js|jsx)$': 'babel-jest', 
      '^.+\\.ts$': [
    'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          target: 'ES2022',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
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
    '^.*\\/utils\\/validator(\\.js)?$': '<rootDir>/__mocks__/validatorMock.js',
  },
   coverageReporters: ['lcov', 'text'],
    coverageDirectory: 'coverage',

  collectCoverageFrom: [
    'client/src/**/*.{js,jsx}',
    'server/src/{controllers,handlers,middlewares,repositories,routes,schemas,services,utils}/**/*.{ts}',

    '!client/src/**/*.test.{js,jsx,mjs}',
    '!server/src/**/*.test.{ts}',
    '!client/src/main.jsx',
    '!client/src/App.jsx',
    '!server/src/**/*.d.ts',
    '!server/src/types/**',
    '!server/src/interfaces/**',
    '!server/dist/**',
  ],
};
