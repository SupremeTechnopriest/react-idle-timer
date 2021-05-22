import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'

const name = 'IdleTimer'
const input = 'src/index.js'
const file = 'dist/index'
const modern = 'dist/modern'

const external = [
  'react',
  'react-dom',
  'prop-types'
]

export default [{
  input,
  output: [{
    name,
    file: `${file}.min.js`,
    sourcemap: true,
    format: 'cjs',
    exports: 'named'
  }, {
    name,
    file: `${file}.es.js`,
    sourcemap: true,
    format: 'es'
  }],
  external: external.concat([/@babel\/runtime/]),
  plugins: [
    resolve(),
    babel({
      babelHelpers: 'runtime',
      skipPreflightCheck: true
    }),
    terser()
  ]
}, {
  input,
  external,
  output: {
    name,
    file: `${modern}.js`,
    sourcemap: true,
    format: 'es'
  },
  plugins: [
    resolve(),
    terser()
  ]
}]
