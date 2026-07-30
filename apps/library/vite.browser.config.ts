import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
   resolve: {
      alias: {
         '@components': path.resolve(__dirname, 'src/components'),
         '@configs': path.resolve(__dirname, 'src/configs'),
         '@utils': path.resolve(__dirname, 'src/utils'),
      },
   },
   plugins: [react()],
   test: {
      include: ['src/**/*.browser.test.tsx'],
      browser: {
         enabled: true,
         provider: 'playwright',
         instances: [
            {
               browser: 'chromium',
               headless: true,
            },
         ],
      },
   },
});
