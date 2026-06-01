import Heading from '@theme/Heading';
import type { ReactNode } from 'react';
import styles from './styles.module.css';

const featureList = [
   {
      title: 'Typed modal contracts',
      description:
         'Define modal params once and keep openModal calls aligned with component props.',
   },
   {
      title: 'Global modal store',
      description:
         'Open and close modals from anywhere without prop drilling or local wiring.',
   },
   {
      title: 'Position-aware motion',
      description:
         'Use sensible default animations for top, bottom, left, right, and corner placements.',
   },
];

export default function HomepageFeatures(): ReactNode {
   return (
      <section className={styles.features}>
         <div className='container'>
            <div className={styles.grid}>
               {featureList.map((feature) => (
                  <article key={feature.title} className={styles.card}>
                     <Heading as='h2' className={styles.title}>
                        {feature.title}
                     </Heading>
                     <p className={styles.description}>{feature.description}</p>
                  </article>
               ))}
            </div>
         </div>
      </section>
   );
}
