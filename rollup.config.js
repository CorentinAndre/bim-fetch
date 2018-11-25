// rollup.config.js
import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript";
import pkg from "./package.json";

export default {
  input: "src/BimFetch.ts",
  output: {
    file: pkg.main,
    format: "es",
    sourcemap: true
  },
  plugins: [
    resolve(),
    typescript(),
    babel({
      exclude: "node_modules/**", // only transpile our source code
      runtimeHelpers: true
    }),
    terser({
      compress: {
        drop_console: true
      }
    })
  ]
};
