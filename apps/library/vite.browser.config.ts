import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

type BrowserName = 'chromium' | 'firefox' | 'webkit';

// Browser tests default to Chromium; set BROWSER_INSTANCES to run the same
// suite elsewhere, for example BROWSER_INSTANCES=firefox,webkit.
const parseBrowsers = (value: string | undefined): BrowserName[] => {
   const requested = (value ?? 'chromium')
      .split(',')
      .map((browser) => browser.trim())
      .filter(Boolean) as BrowserName[];

   return requested.length > 0 ? requested : ['chromium'];
};

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
         instances: parseBrowsers(process.env.BROWSER_INSTANCES).map(
            (browser) => ({
               browser,
               headless: true,
            }),
         ),
      },
   },
});
