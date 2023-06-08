const { concurrent } = require('nps-utils')

module.exports = {
  scripts: {
    build: {
      default: concurrent.nps('build.source', 'build.types'),
      source: 'scripts/build.js',
      types: 'tsc --project tsconfig.build.json'
    },
    watch: 'scripts/build.js -w',
    lint: 'eslint src/*',
    fix: 'eslint src/* --fix',
    test: 'jest',
    docs: {
      dev: 'cd docs && ./node_modules/.bin/next dev',
      build: 'cd docs && ./node_modules/.bin/next build'
    }
  }
}
