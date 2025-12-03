import { defineConfig } from 'tsdown';

// Shared configuration - can be used with workspace mode from root
// or as a reference for per-package configs
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
  treeshake: true,
  platform: 'node',
  target: 'node24',
  sourcemap: false,
  skipNodeModulesBundle: true,
  // Output .js for ESM and .cjs for CJS to match package.json exports
  // Note: format value is 'es' not 'esm' at runtime
  outExtensions: ({ format }) => ({
    js: format === 'es' ? '.js' : '.cjs',
    dts: format === 'es' ? '.d.ts' : '.d.cts',
  }),
});
