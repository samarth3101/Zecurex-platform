'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import styles from '@/styles/components/AboutSection.module.scss';
import heroAnimation from '@/assets/animations/sec.json';

interface AboutSectionProps {
  isVisible?: boolean;
}

// Icon Components
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const AnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
);
const NetworkIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6" /><path d="m5.64 7.05 4.95 4.95m4.95-4.95-4.95 4.95" /><path d="m7.05 5.64 4.95 4.95m4.95 4.95-4.95-4.95" /></svg>
);
const AutomationIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);

export default function AboutSection({ isVisible = true }: AboutSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: <ShieldIcon />,
      title: 'Advanced Threat Prevention',
      description: 'Next-generation defense mechanisms that stop sophisticated attacks before they infiltrate your network.'
    },
    {
      icon: <AnalyticsIcon />,
      title: 'Behavioral Analysis',
      description: 'Deep learning algorithms that understand normal patterns and instantly detect anomalous activities.'
    },
    {
      icon: <NetworkIcon />,
      title: 'Zero-Trust Architecture',
      description: 'Comprehensive verification system that trusts nothing and validates everything across your entire infrastructure.'
    },
    {
      icon: <AutomationIcon />,
      title: 'Intelligent Automation',
      description: 'Smart response protocols that neutralize threats autonomously while keeping your operations running smoothly.'
    }
  ];

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [features.length]);

  if (!mounted) return null;

  return (
    <section className={styles.cleverHero} id="about">
      <div className={styles.container}>
        {/* Background Elements */}
        <div className={styles.backgroundElements}>
          <div className={styles.orb1}></div>
          <div className={styles.orb2}></div>
          <div className={styles.gridPattern}></div>
        </div>

        {/* Main Window */}
        <div className={`${styles.heroWindow} ${isVisible ? styles.slideIn : ''}`}>
          <div className={styles.windowHeader}>
            <div className={styles.windowControls}>
              <span className={styles.control}></span>
              <span className={styles.control}></span>
              <span className={styles.control}></span>
            </div>
            <div className={styles.windowTitle}>Zecure ONE</div>
          </div>
          <div className={styles.contentArea}>
            {/* Left - Text Content */}
            <div className={styles.leftSection}>
              <div className={styles.badge}>
                <span className={styles.badgeText}>Next-Gen Cybersecurity</span>
              </div>
              <h1 className={styles.mainHeading}>
                Enterprise Security <span className={styles.accent}>Reimagined</span>
              </h1>
              <p className={styles.description}>
                <span className={styles.accent}>Zecure ONE</span> delivers enterprise-grade cybersecurity through cutting-edge AI, providing autonomous threat detection and response.
              </p>
              <div className={styles.featureShowcase}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    {features[currentFeature].icon}
                  </div>
                  <div className={styles.featureContent}>
                    <h3 className={styles.featureTitle}>
                      {features[currentFeature].title}
                    </h3>
                    <p className={styles.featureDesc}>
                      {features[currentFeature].description}
                    </p>
                  </div>
                </div>
                <div className={styles.featureDots}>
                  {features.map((_, index) => (
                    <button
                      key={index}
                      className={`${styles.dot} ${index === currentFeature ? styles.active : ''}`}
                      onClick={() => setCurrentFeature(index)}
                      aria-label={`Feature ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => window.location.href = '/register'}
                >
                  Start Free Trial
                </button>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Schedule Demo
                </button>
              </div>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>500+</span>
                  <span className={styles.statLabel}>Enterprises</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>99.97%</span>
                  <span className={styles.statLabel}>Detection Rate</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>0.3s</span>
                  <span className={styles.statLabel}>Response Time</span>
                </div>
              </div>
            </div>
            {/* Right - Visual */}
            <div className={styles.rightSection}>
              <div className={styles.animationWrapper}>
                <Lottie
                  animationData={heroAnimation}
                  className={styles.heroAnimation}
                  loop={true}
                  autoplay={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
