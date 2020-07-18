import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const FILE = 'dist/index'
const NAME = 'IdleTimer'

export default {
  input: 'src/index.js',
  output: [{
    name: NAME,
    file: `${FILE}.min.js`,
    sourcemap: true,
    format: 'cjs',
    exports: 'named'
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
    resolve(),
    terser()
  ]
}
