import babel from 'rollup-plugin-babel'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify-es'
import progress from 'rollup-plugin-progress'

const FILE = 'dist/index'
const NAME = 'IdleTimer'

export default {
  input: 'src/index.js',
  output: [{
    name: NAME,
    file: `${FILE}.min.js`,
    sourcemap: true,
    format: 'cjs'
  }, {
    name: NAME,
    file: `${FILE}.es.js`,
    sourcemap: true,
    format: 'es'
  }],
  external: [
    'react',
    'react-dom',
    'prop-types'
  ],
  plugins: [
    babel({
      exclude: [ 'node_modules/**' ]
    }),
    resolve({
      main: true,
      module: true,
      preferBuiltins: true,
      browser: true
    }),
    builtins(),
    globals(),
    uglify(),
    progress()
  ]
}
