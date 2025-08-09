'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import styles from '@/styles/components/landing.module.scss';

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Start hero animation after component mounts
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={`${styles.logoContainer} ${animate ? styles.animateIn : ''}`}>
          <h1 className={styles.logo}>ZECURE ONE</h1>
        </div>
        <div className={`${styles.taglineContainer} ${animate ? styles.animateInDelay1 : ''}`}>
          <p className={styles.tagline}>
            The AI Agent That Watches Over You
          </p>
        </div>
        <div className={`${styles.buttonContainer} ${animate ? styles.animateInDelay2 : ''}`}>
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
