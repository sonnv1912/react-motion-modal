import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rspress/core';
import { pluginPlayground } from '@rspress/plugin-playground';
import libraryPackage from '../library/package.json';

const documentRoot = fileURLToPath(new URL('.', import.meta.url));
const librarySource = resolve(documentRoot, '../library/src');

export default defineConfig({
   root: resolve(documentRoot, 'docs'),
   outDir: resolve(documentRoot, 'build'),
   base: '/react-motion-modal/',
   siteOrigin: 'https://sonnv1912.github.io',
   title: 'react-motion-modal',
   description: 'Typed modal management for React with motion-aware defaults.',
   icon: '/img/favicon.ico',
   logo: '/img/logo.png',
   logoText: 'react-motion-modal',
   lang: 'en',
   globalStyles: resolve(documentRoot, 'theme/styles.css'),
   route: {
      exclude: ['**/components/**', '**/*.test.*'],
   },
   builderConfig: {
      resolve: {
         alias: {
            '@components': resolve(librarySource, 'components'),
            '@configs': resolve(librarySource, 'configs'),
            '@utils': resolve(librarySource, 'utils'),
         },
      },
   },
   plugins: [
      pluginPlayground({
         defaultDirection: 'vertical',
         editorPosition: 'left',
         include: [['react-motion-modal', resolve(librarySource, 'index.ts')]],
      }),
   ],
   themeConfig: {
      darkMode: 'force-dark',
      search: true,
      enableContentAnimation: true,
      editLink: {
         docRepoBaseUrl:
            'https://github.com/sonnv1912/react-motion-modal/tree/main/apps/document/docs',
      },
      nav: [
         {
            text: 'Docs',
            link: '/docs/intro',
            activeMatch: '^/docs/',
         },
         {
            text: 'Playground',
            link: '/playground',
         },
         {
            text: 'Changelog',
            link: '/docs/changelog',
         },
         {
            text: `v${libraryPackage.version}`,
            link: 'https://www.npmjs.com/package/react-motion-modal',
            position: 'right',
         },
      ],
      sidebar: {
         '/docs/': [
            {
               text: 'Introduction',
               link: '/docs/intro',
            },
            {
               text: 'Getting Started',
               link: '/docs/getting-started',
            },
            {
               text: 'API',
               items: [
                  {
                     text: 'Modal System',
                     link: '/docs/api/system',
                  },
                  {
                     text: 'ModalProvider',
                     link: '/docs/api/provider',
                  },
                  {
                     text: 'Modal Contracts',
                     link: '/docs/api/modal-contracts',
                  },
               ],
            },
            {
               text: 'Guides',
               items: [
                  {
                     text: 'Positions and Animation',
                     link: '/docs/guides/positions-and-animation',
                  },
                  {
                     text: 'Styling',
                     link: '/docs/guides/styling',
                  },
                  {
                     text: 'Migrating to v2',
                     link: '/docs/guides/migrating-to-v2',
                  },
               ],
            },
            {
               text: 'Changelog',
               link: '/docs/changelog',
            },
         ],
      },
      socialLinks: [
         {
            icon: 'github',
            mode: 'link',
            content: 'https://github.com/sonnv1912/react-motion-modal',
         },
         {
            icon: 'npm',
            mode: 'link',
            content: 'https://www.npmjs.com/package/react-motion-modal',
         },
      ],
      footer: {
         message: `Copyright © ${new Date().getFullYear()} react-motion-modal.`,
      },
   },
});
