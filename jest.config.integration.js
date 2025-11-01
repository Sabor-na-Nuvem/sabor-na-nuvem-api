export default {
  testEnvironment: 'node',

  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!\\.prisma/client|@prisma/client|@joaoschmitz/express-prisma-auth)'
  ],
  
  testMatch: ['<rootDir>/src/**/*.integration.test.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/'],
  clearMocks: true,
  testTimeout: 30000,

  setupFiles: ['./jest.setup.integration.js'],
};