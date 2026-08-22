'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.scss';
import Lightfall from '@/components/ui/Lightfall';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 300); // fade transition gap
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className={styles.main}>
      
      {/* Loading Screen */}
      <div className={`${styles.loaderOverlay} ${!isLoading ? styles.hidden : ''}`}>
        <div className={styles.loaderContainer}>
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <div className={styles.dot}></div>
          </div>
          <div className={styles.loadingText}>Zecure</div>
        </div>
      </div>

      {/* Dynamic Logo (Transitions from Hero to Nav) */}
      <h1 
        className={`${styles.dynamicLogo} ${showContent ? styles.visible : ''} ${
          isScrolled ? styles.logoNav : styles.logoHero
        }`}
      >
        ZECURE
      </h1>

      {/* Hero Section */}
      <section className={styles.heroSectionWrapper}>
        <div className={`${styles.heroSection} ${showContent ? styles.visible : ''}`}>
          <div className={styles.heroBackground}>
            <Lightfall
              colors={['#00d4ff', '#33deff', '#00aacc']}
              backgroundColor="#000000"
              speed={0.2}
              streakCount={2}
              streakWidth={1}
              streakLength={1}
              glow={1}
              density={1}
              twinkle={1}
              zoom={2}
              backgroundGlow={0}
              opacity={1}
              mouseInteraction={true}
              mouseStrength={0.15}
              mouseRadius={0.5}
            />
          </div>
          
          <div className={styles.heroContent}>
            <div className={styles.logoSpacer}></div>
            <p className={`${styles.heroSubtext} ${isScrolled ? styles.hidden : ''}`}>
              Payment risk intelligence, in real time.
            </p>
          </div>
          
          <div className={`${styles.scrollIndicator} ${isScrolled ? styles.hidden : ''}`}>
            Scroll to enter &rarr;
          </div>
        </div>
      </section>
      
      {/* Next Section Placeholder */}
      <section className={styles.nextSection}>
        <div className={styles.placeholderContent}>
          <h2>Next Section Placeholder</h2>
          <p>Content will go here...</p>
        </div>
      </section>

    </main>
  );
}