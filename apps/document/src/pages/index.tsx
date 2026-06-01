import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './index.module.css';

function HomepageHeader() {
   const { siteConfig } = useDocusaurusContext();
   return (
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
         <div className={clsx('container', styles.heroContainer)}>
            <div className={styles.heroContent}>
               <Heading as='h1' className={styles.heroTitle}>
                  Typed <span>modal flows</span> for React apps that need
                  motion, stacking, and predictable state.
               </Heading>
               <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
               <div className={styles.buttons}>
                  <Link
                     className='button button--primary button--lg'
                     to='/docs/intro'
                  >
                     Get Started
                  </Link>
                  <Link
                     className='button button--secondary button--lg'
                     to='/docs/api/store'
                  >
                     API Reference
                  </Link>
                  <Link
                     className={styles.npmBadge}
                     href='https://www.npmjs.com/package/react-motion-modal'
                     title='View react-motion-modal on npm'
                  >
                     <img
                        src='https://img.shields.io/npm/dm/react-motion-modal?style=for-the-badge&logo=npm&label=npm'
                        alt='npm monthly downloads'
                     />
                  </Link>
               </div>
            </div>
            <div className={styles.heroVisual} aria-hidden='true'>
               <img
                  src='/react-motion-modal/img/logo.png'
                  alt=''
                  className={styles.heroImage}
               />
            </div>
         </div>
      </header>
   );
}

export default function Home(): ReactNode {
   const { siteConfig } = useDocusaurusContext();
   return (
      <Layout
         title={siteConfig.title}
         description='Documentation for the react-motion-modal library.'
      >
         <HomepageHeader />
         <main>
            <HomepageFeatures />
         </main>
      </Layout>
   );
}
