/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: '<rootDir>/src/__tests__/globalSetup.ts',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/jestSetup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],
  testTimeout: 15000,
}

module.exports = config
