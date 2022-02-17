export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '/docs/'
  ],
  setupFiles: [
    './tests/test.setup.ts'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/TabManager/*.ts',
    'src/utils/*.ts',
    'src/*.tsx',
    'src/*.ts'
  ]
}
