'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import Button from '@/components/common/Button';
import styles from '@/styles/components/Hero.module.scss';

// Direct import of JSON animation
import heroAnimation from '@/assets/animations/hero.json';

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
      <div className={styles.container}>

        {/* Left Panel - Hero Content */}
        <div className={styles.leftPanel}>
          <div className={`${styles.content} ${isVisible ? styles.slideIn : ''}`}>
            <div className={styles.badge}>
              <span className={styles.badgeText}>AI Security</span>
            </div>

            {/* <h1 className={styles.mainHeading}>
              Tomorrow's Security,<br />
              <span className={styles.accent}>Available Today</span>
            </h1> */}
            <h1 className={styles.mainHeading}>
              AI Security.<br />
              <span className={styles.accent}>Redefined.</span>
            </h1>

            <p className={styles.description}>
              Traditional security wasn't built for the AI age. <span className={styles.accent}> <br /> Zecure ONE</span> uses state-of-the-art artificial intelligence to continuously monitor and protect your digital world — intelligent, seamless security that's always one step ahead.
            </p>


            <div className={styles.buttons}>
              <Button
                size="lg"
                onClick={() => {
                  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See How It Works
              </Button>

              <Button
                size="lg"
                variant="outline"
                className={styles.auroraButton}
                onClick={() => window.location.href = '/register'}
              >
                Get Started
              </Button>
            </div>

            {/* Stats Row */}
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>24/7</span>
                <span className={styles.statLabel}>Monitoring</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>99.9%</span>
                <span className={styles.statLabel}>Uptime</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>AI</span>
                <span className={styles.statLabel}>Powered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Lottie Animation */}
        <div className={styles.rightPanel}>
          <div className={`${styles.visualContainer} ${isVisible ? styles.fadeIn : ''}`}>

            {/* Lottie Animation Container */}
            <div className={styles.animationContainer}>
              <Lottie
                animationData={heroAnimation}
                className={styles.lottieAnimation}
                loop={true}
                autoplay={true}
              />
            </div>

            {/* Floating status indicators */}
            <div className={styles.statusIndicators}>
              <div className={`${styles.indicator} ${styles.secure}`}>
                <div className={styles.indicatorDot}></div>
                <span>Secure</span>
              </div>
              <div className={`${styles.indicator} ${styles.monitoring}`}>
                <div className={styles.indicatorDot}></div>
                <span>Monitoring</span>
              </div>
              <div className={`${styles.indicator} ${styles.protected}`}>
                <div className={styles.indicatorDot}></div>
                <span>Protected</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
