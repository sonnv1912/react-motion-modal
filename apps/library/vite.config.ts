/// <reference types="vitest/config" />

import path, { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
   resolve: {
      alias: {
         '@stores': path.resolve(__dirname, 'src/stores'),
         '@components': path.resolve(__dirname, 'src/components'),
         '@configs': path.resolve(__dirname, 'src/configs'),
         '@utils': path.resolve(__dirname, 'src/utils'),
         '#types': path.resolve(__dirname, 'src/types'),
      },
   },
   plugins: [
      react(),
      dts({
         include: ['src'],
         tsconfigPath: './tsconfig.app.json',
         rollupTypes: true,
      }),
   ],
   build: {
      lib: {
         entry: resolve(__dirname, 'src/index.ts'),
         name: 'index',
         fileName: 'index',
         formats: ['es'],
      },
      minify: true,
      rollupOptions: {
         external: ['react', 'react/jsx-runtime', 'react-dom'],
         output: {
            globals: {
               react: 'React',
            },
         },
      },
   },
});
