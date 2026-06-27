import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

// The example imports the library SOURCE directly (not the built dist) so
// edits to apps/library hot-reload instantly without rebuilding. The library's
// internal path aliases are mirrored here so its source resolves correctly.
const librarySrc = resolve(__dirname, '../library/src');

export default defineConfig({
   plugins: [react()],
   resolve: {
      alias: {
         'react-motion-modal': resolve(librarySrc, 'index.ts'),
         '@stores': resolve(librarySrc, 'stores'),
         '@components': resolve(librarySrc, 'components'),
         '@configs': resolve(librarySrc, 'configs'),
         '@utils': resolve(librarySrc, 'utils'),
         '#types': resolve(librarySrc, 'types'),
      },
   },
});
