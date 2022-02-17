#!/usr/bin/env node
const fs = require('fs-extra')
const { build, ts, dirname, glob, log } = require('estrella')

const entry = './src/index.ts'
const outCJS = './dist/index.js'
const outESM = './dist/index.mjs'

// Clear destination folder
fs.emptyDirSync('./dist')

const common = {
  entry,
  bundle: true,
  sourcemap: true,
  minify: true,
  platform: 'browser',
  external: ['react', 'react-dom']
}

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
  format: 'esm',
  onEnd (config) {
    const dtsFilesOutDir = dirname(config.outfile)
    const tsconfig = fs.readJsonSync('./tsconfig.json')
    generateTypeDefs(tsconfig, config.entry, dtsFilesOutDir)
  }
})

function generateTypeDefs (tsconfig, entryFiles, outDir) {
  const filenames = Array.from(
    new Set(
      (Array.isArray(entryFiles)
        ? entryFiles
        : [entryFiles]
      ).concat(tsconfig.include || [])
    )
  ).filter(v => v)

  log.info('Generating type declaration files for', filenames.join(', '))
  const compilerOptions = {
    ...tsconfig.compilerOptions,
    moduleResolution: undefined,
    outDir
  }
  const program = ts.ts.createProgram(filenames, compilerOptions)
  const targetSourceFile = undefined
  const writeFile = undefined
  const cancellationToken = undefined
  const emitOnlyDtsFiles = true
  program.emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles)
  log.info('Wrote', glob(outDir + '/*.d.ts').join(', '))
}
