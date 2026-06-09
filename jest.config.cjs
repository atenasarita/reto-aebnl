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
    '/node_modules/(?!(react-simple-maps|d3-geo|d3-array|d3-color|d3-format|d3-interpolate|d3-scale|d3-time|internmap|delaunator|robust-predicates)/)',
    ],
    moduleNameMapper: {
  '^react$': '<rootDir>/client/node_modules/react',
  '^react/jsx-runtime$': '<rootDir>/client/node_modules/react/jsx-runtime',
  '^react-dom$': '<rootDir>/client/node_modules/react-dom',
  '^react-dom/client$': '<rootDir>/client/node_modules/react-dom/client',

  '\\.module\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.cjs',
  '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.cjs',

  // '\\.module\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  // '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

  '\\.(png|jpg|jpeg|svg|gif)$': '<rootDir>/__mocks__/fileMock.js',

  '^.*\\/utils\\/config(\\.js)?$': '<rootDir>/__mocks__/configMock.js',
  '^.*\\/utils\\/espinaBifidaTypes(\\.js)?$': '<rootDir>/__mocks__/espinaBifidaMock.js',
  '^framer-motion$': '<rootDir>/__mocks__/framerMotionMock.js',
  '^.*\\/utils\\/validator(\\.js)?$': '<rootDir>/__mocks__/validatorMock.js',
  '^jspdf$': '<rootDir>/__mocks__/jspdfMock.js',
  '^jspdf-autotable$': '<rootDir>/__mocks__/jspdfAutotableMock.js',
  '^.*\\/constants\\/aebnlSiteAssets(\\.js)?$': '<rootDir>/__mocks__/aebnlSiteAssetsMock.js',
},
   coverageReporters: ['lcov', 'text'],
    coverageDirectory: 'coverage',
};
