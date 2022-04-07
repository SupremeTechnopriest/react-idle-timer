export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '/docs/'
  ],
  setupFilesAfterEnv: [
    './tests/test.setup.ts'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/TabManager/*.ts',
    'src/utils/*.ts',
    'src/*.ts',
    'src/*.tsx'
  ]
}
