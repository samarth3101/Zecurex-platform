'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.scss';
import Lightfall from '@/components/ui/Lightfall';
import BehaviorSection from '@/components/landing/BehaviorSection';
import InvestigateSection from '@/components/landing/InvestigateSection';
import EnterSection from '@/components/landing/EnterSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Lock scroll immediately so page can't show mid-scroll state under the loader
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      // Snap to top silently before revealing content
      window.scrollTo({ top: 0, behavior: 'instant' });
      setIsLoading(false);

      // Small gap so opacity transition starts after scroll snap settles
      setTimeout(() => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        setShowContent(true);
      }, 400);
    }, 1600);

    return () => {
      clearTimeout(timer);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
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

      {/* 01 — HERO */}
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

      {/* 02 — BEHAVIORAL RISK INTELLIGENCE */}
      <BehaviorSection />

      {/* 03 — INVESTIGATE THE WHY */}
      <InvestigateSection />

      {/* 04 — ENTER ZECURE */}
      <EnterSection />

      {/* FOOTER */}
      <Footer />

    </main>
  );
}