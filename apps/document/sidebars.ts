import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
   tutorialSidebar: [
      'intro',
      'getting-started',
      {
         type: 'category',
         label: 'API',
         items: ['api/store', 'api/provider', 'api/base-modal-params'],
      },
      {
         type: 'category',
         label: 'Guides',
         items: ['guides/positions-and-animation', 'guides/styling'],
      },
   ],
};

export default sidebars;
