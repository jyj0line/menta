import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
 
const vitestConfig = defineConfig({
  plugins: [react(), tsconfigPaths()],

  test: {
    environment: 'jsdom',
    css: true,
    setupFiles: [
      './tests/vitest/setups/setup.ts'
    ],
    include: [
      '**/*.test.{ts,tsx}'
    ],
    coverage: {
      enabled: true,
      exclude: [
        './tests/**/*'
      ]
    },

    // next-intl is bundled as ESM-only, which requires the usage of explicit file extensions internally.
    // However, in order to avoid a deoptimization in Next.js,
    // next-intl currently has to import from next/navigation instead of next/navigation.js.
    // Vitest correctly assumes a file extension though, therefore for the time being,
    // if you’re using createNavigation, you need to ask Vitest to process imports within next-intl:
    server: {
      deps: {
        // https://github.com/vercel/next.js/issues/77200
        inline: ['next-intl']
      }
    }
  },
})
export default vitestConfig;