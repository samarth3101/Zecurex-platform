'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import styles from '@/styles/components/landing.module.scss';

interface HeroSectionProps {
  isVisible?: boolean;
}

export default function HeroSection({ isVisible = false }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={`${styles.logoContainer} ${isVisible ? styles.animateIn : ''}`}>
          <h1 className={styles.logo}>ZECURE ONE</h1>
        </div>
        <div className={`${styles.taglineContainer} ${isVisible ? styles.animateInDelay1 : ''}`}>
          <p className={styles.tagline}>
            The AI Agent That Watches Over You
          </p>
        </div>
        <div className={`${styles.buttonContainer} ${isVisible ? styles.animateInDelay2 : ''}`}>
          <Button size="lg" onClick={() => {
            document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Explore Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
