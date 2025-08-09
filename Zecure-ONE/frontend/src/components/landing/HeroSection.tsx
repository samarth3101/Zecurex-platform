'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import styles from '@/styles/components/landing.module.scss';

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className={styles.hero}>
      <div className={styles.backgroundMesh} />
      <div className={styles.content}>
        <h1 className={styles.logo}>ZECURE ONE</h1>
        <p className={styles.tagline}>
          The AI Agent That Watches Over You
        </p>
        <Button size="lg" onClick={() => {
          document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
        }}>
          Explore Demo
        </Button>
      </div>
    </section>
  );
}
