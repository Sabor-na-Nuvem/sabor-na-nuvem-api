export default {
  testEnvironment: 'node',
  transform: {},

  // Apenas arquivos .integration.test.js
  testMatch: ['<rootDir>/src/**/*.integration.test.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/'],
  clearMocks: true,

  // Aumenta o timeout, pois testes de banco são mais lentos
  testTimeout: 30000,

  setupFiles: ['./jest.setup.integration.js'],
};
