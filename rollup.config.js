// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

import pkg from './package.json';

export default {
  input: 'src/bim-fetch.js',
  output: [{
    file: pkg.main,
    format: 'cjs',
    sourcemap: true,
  },{
    file: pkg.module,
    format: 'es',
    sourcemap: true,
  }],
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    }),
    uglify({
      compress:{
        drop_console:true,
      }
    }),
  ]
};
