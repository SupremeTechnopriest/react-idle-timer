module.exports = {
  scripts: {
    build: 'scripts/build.js',
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
