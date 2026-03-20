#!/usr/bin/env node
const { dirname } = require('node:path')
const fs = require('fs-extra')
const { build } = require('esbuild')
const { es5Plugin } = require('esbuild-plugin-es5')

const entry = './src/index.ts'
const outLegacyCJS = './dist/index.legacy.cjs.js'
const outLegacyESM = './dist/index.legacy.esm.mjs'
const outCJS = './dist/index.cjs.js'
const outESM = './dist/index.esm.mjs'

// Clear destination folder
fs.emptyDirSync('./dist')

const common = {
  entryPoints: [entry],
  bundle: true,
  minify: true,
  platform: 'browser',
  external: ['react', 'react-dom']
}

// Build legacy source
build({
  ...common,
  outfile: outLegacyCJS,
  format: 'cjs',
  target: ['es5'],
  plugins: [es5Plugin()],
  alias: {
    '@swc/helpers': dirname(require.resolve('@swc/helpers/package.json'))
  }
})


build({
  ...common,
  outfile: outLegacyESM,
  format: 'esm',
  target: ['es5'],
  plugins: [es5Plugin()],
  alias: {
    '@swc/helpers': dirname(require.resolve('@swc/helpers/package.json'))
  }
})

// Build cjs source
build({
  ...common,
  outfile: outCJS,
  format: 'cjs'
})

// Build esm source and type definitions
build({
  ...common,
  outfile: outESM,
  format: 'esm'
})
