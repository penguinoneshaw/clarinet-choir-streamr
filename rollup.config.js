import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import builtins from 'rollup-plugin-node-builtins';

const config = [
  {
    input: 'src/control-panel/index.js',
    output: {
      file: 'public/scripts/control-panel-bundle.js',
      format: 'module',
      name: 'baseModule'
    },
    plugins: [
      resolve({ mainFields: ['module', 'jsnext:main', 'browser'], preferBuiltins: true }),
      commonjs(),
      false && terser()
    ]
  },
  {
    input: 'src/omnibar/index.js',
    output: {
      file: 'public/scripts/omnibar-bundle.js',
      format: 'module',
      name: 'baseModule'
    },
    plugins: [
      resolve({ mainFields: ['module', 'jsnext:main', 'browser'], preferBuiltins: true }),
      commonjs(),
      false && terser()
    ]
  }
];

export default config;
