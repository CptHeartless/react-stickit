import typescript from "rollup-plugin-typescript2";

const input = "src/index.ts";
const tsconfigOverride = { compilerOptions: { module: "ESNext" } };

const plugins = [
  typescript({
    tsconfigOverride,
  }),
];

export default [
  {
    preserveModules: true,
    input,
    output: {
      dir: "dist/esm",
      format: "esm",
    },
    plugins,
  },
  {
    preserveModules: true,
    input,
    output: {
      dir: 'dist/cjs',
      format: "cjs",
    },
    plugins,
  },
];
