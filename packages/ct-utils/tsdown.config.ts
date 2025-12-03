import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
  treeshake: true,
  platform: 'node',
  target: 'node22',
  sourcemap: false,
  skipNodeModulesBundle: true,
  // Output .js for ESM and .cjs for CJS to match package.json exports
  outExtensions: ({ format }) => ({
    js: format === 'es' ? '.js' : '.cjs',
    dts: format === 'es' ? '.d.ts' : '.d.cts',
  }),
});
