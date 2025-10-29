export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['<rootDir>/src/**/*.test.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/'],
  clearMocks: true,
};
