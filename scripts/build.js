#!/usr/bin/env node
const fs = require('fs-extra')
const { build, ts, dirname, glob, log } = require('estrella')

const entry = './src/index.ts'
const outfile = './dist/index.js'

// Clear destination folder
fs.emptyDirSync('./dist')

// Build source
build({
  entry,
  outfile,
  bundle: true,
  sourcemap: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  external: ['react', 'react-dom'],
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
