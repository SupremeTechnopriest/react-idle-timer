#!/usr/bin/env node
const fs = require('fs-extra')
const { build, ts, dirname, glob, log } = require('estrella')

const entry = './src/index.ts'
const outCJS = './dist/index.cjs.js'
const outESM = './dist/index.esm.js'

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
  log.info('Generating type declaration files for', entryFiles.join(', '))
  const compilerOptions = {
    ...tsconfig.compilerOptions,
    moduleResolution: undefined,
    outDir
  }
  const program = ts.ts.createProgram(entryFiles, compilerOptions)
  const targetSourceFile = undefined
  const writeFile = undefined
  const cancellationToken = undefined
  const emitOnlyDtsFiles = true
  const result = program.emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles)
  if (result.emitSkipped) console.log(result)
  log.info('Wrote', glob(outDir + '/**/*.d.ts').join(', '))
}
