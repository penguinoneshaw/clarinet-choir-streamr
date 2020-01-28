import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import svg from 'rollup-plugin-svg';
import pug from 'rollup-plugin-pug';
import scss from 'rollup-plugin-scss';
import copy from 'rollup-plugin-copy';
import sucrase from '@rollup/plugin-sucrase';

const config = [
  {
    input: 'src/control-panel/index.ts',
    output: {
      file: 'dist/public/scripts/control-panel-bundle.js',
      format: 'module',
      name: 'baseModule'
    },
    plugins: [
      resolve({ mainFields: ['module', 'jsnext:main', 'browser'], preferBuiltins: true, extensions: ['.js', '.ts'] }),

      pug(),
      process.env.BUILD === 'production' && terser(),
      scss({ output: 'dist/public/css/index.css' }),
      copy({
        targets: [
          {
            src: 'src/images/**/*',
            dest: 'dist/public/images'
          }
        ]
      }),
      sucrase({ exclude: ['node_modules/**'], transforms: ['typescript'] }),
      commonjs({ extensions: ['.js', '.ts'] })
    ]
  },
  {
    input: 'src/overlay/index.js',
    output: {
      file: 'dist/public/scripts/overlay-bundle.js',
      format: 'module',
      name: 'overlaysModule'
    },
    plugins: [
      resolve({ mainFields: ['module', 'jsnext:main', 'browser'], preferBuiltins: true }),
      commonjs(),
      svg(),
      process.env.BUILD === 'production' && terser(),
      scss({ output: 'dist/public/css/overlay.css' })
    ]
  }
];

export default config;
