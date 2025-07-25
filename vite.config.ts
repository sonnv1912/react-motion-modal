/// <reference types="vitest/config" />

import path, { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
   resolve: {
      alias: {
         '@hooks': path.resolve(__dirname, 'src/hooks'),
         '@components': path.resolve(__dirname, 'src/components'),
         '#types': path.resolve(__dirname, 'src/types'),
      },
   },
   plugins: [
      react(),
      cssInjectedByJsPlugin(),
      dts({
         include: ['src'],
         tsconfigPath: './tsconfig.app.json',
         rollupTypes: true,
      }),
      tailwindcss(),
   ],
   build: {
      lib: {
         entry: resolve(__dirname, 'src/index.ts'),
         name: 'index',
         fileName: 'index',
         formats: ['es'],
      },
      rollupOptions: {
         external: ['react', 'react/jsx-runtime'],
         output: {
            globals: {
               react: 'React',
            },
         },
      },
   },
});
