import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { createRequire } from 'node:module';
import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const require = createRequire(import.meta.url);
const libraryPackage = require('../library/package.json') as { version: string };

const config: Config = {
   title: 'react-motion-modal',
   tagline: 'Typed modal management for React with motion-aware defaults',
   favicon: 'img/favicon.ico',

   // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
   future: {
      v4: true, // Improve compatibility with the upcoming Docusaurus v4
   },

   // Set the production url of your site here
   url: 'https://sonnv1912.github.io',
   // Set the /<baseUrl>/ pathname under which your site is served
   // For GitHub pages deployment, it is often '/<projectName>/'
   baseUrl: '/react-motion-modal/',

   // GitHub pages deployment config.
   // If you aren't using GitHub pages, you don't need these.
   organizationName: 'sonnv1912',
   projectName: 'react-motion-modal',

   onBrokenLinks: 'throw',

   // Even if you don't use internationalization, you can use this field to set
   // useful metadata like html lang. For example, if your site is Chinese, you
   // may want to replace "en" with "zh-Hans".
   i18n: {
      defaultLocale: 'en',
      locales: ['en'],
   },

   presets: [
      [
         'classic',
         {
            docs: {
               sidebarPath: './sidebars.ts',
               editUrl:
                  'https://github.com/sonnv1912/react-motion-modal/tree/main/apps/document/',
            },
            blog: false,
            theme: {
               customCss: './src/css/custom.css',
            },
         } satisfies Preset.Options,
      ],
   ],

   themeConfig: {
      colorMode: {
         defaultMode: 'dark',
         disableSwitch: true,
         respectPrefersColorScheme: false,
      },
      navbar: {
         title: 'react-motion-modal',
         logo: {
            alt: 'react-motion-modal',
            src: 'img/logo.png',
         },
         items: [
            {
               type: 'docSidebar',
               sidebarId: 'tutorialSidebar',
               position: 'left',
               label: 'Docs',
            },
            {
               to: '/docs/changelog',
               label: 'Changelog',
               position: 'left',
            },
            {
               href: 'https://www.npmjs.com/package/react-motion-modal',
               label: `v${libraryPackage.version}`,
               position: 'right',
               className: 'navbarVersion',
            },
            {
               href: 'https://github.com/sonnv1912/react-motion-modal',
               label: 'GitHub',
               position: 'right',
            },
         ],
      },
      footer: {
         style: 'dark',
         links: [
            {
               title: 'Docs',
               items: [
                  {
                     label: 'Getting Started',
                     to: '/docs/getting-started',
                  },
               ],
            },
            {
               title: 'Package',
               items: [
                  {
                     label: 'npm',
                     href: 'https://www.npmjs.com/package/react-motion-modal',
                  },
                  {
                     label: 'GitHub',
                     href: 'https://github.com/sonnv1912/react-motion-modal',
                  },
               ],
            },
            {
               title: 'More',
               items: [
                  {
                     label: 'Changelog',
                     to: '/docs/changelog',
                  },
                  {
                     label: 'GitHub',
                     href: 'https://github.com/sonnv1912/react-motion-modal',
                  },
               ],
            },
         ],
         copyright: `Copyright © ${new Date().getFullYear()} react-motion-modal.`,
      },
      prism: {
         theme: prismThemes.github,
         darkTheme: prismThemes.dracula,
      },
   } satisfies Preset.ThemeConfig,
};

export default config;
