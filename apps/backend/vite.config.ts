import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './src/test/setup.ts',
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    tsconfig: './tsconfig.json',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'src/test/', '**/*.test.ts'],
    },
    deps: {
      inline:
        [
          '@artplim/shared',
          '@artplim/types',
        ],
    },
  },
});