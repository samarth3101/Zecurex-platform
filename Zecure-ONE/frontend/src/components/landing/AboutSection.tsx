'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import styles from '@/styles/components/AboutSection.module.scss';

// Import your JSON animation
import heroAnimation from '@/assets/animations/sec.json';

interface CleverHeroProps {
  isVisible?: boolean;
}

// Icon Components
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
  </svg>
);

const NetworkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6" />
    <path d="m5.64 7.05 4.95 4.95m4.95-4.95-4.95 4.95" />
    <path d="m7.05 5.64 4.95 4.95m4.95 4.95-4.95-4.95" />
  </svg>
);

const AutomationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SecurityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <circle cx="12" cy="16" r="1" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function CleverHero({ isVisible = true }: CleverHeroProps) {
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
    <section className={styles.cleverHero}>
      <div className={styles.container}>

        {/* Background Elements */}
        <div className={styles.backgroundElements}>
          <div className={styles.orb1}></div>
          <div className={styles.orb2}></div>
          <div className={styles.gridPattern}></div>
        </div>

        {/* Main Content Window - Compact */}
        <div className={`${styles.heroWindow} ${isVisible ? styles.slideIn : ''}`}>

          {/* Header Bar */}
          <div className={styles.windowHeader}>
            <div className={styles.windowControls}>
              <span className={styles.control}></span>
              <span className={styles.control}></span>
              <span className={styles.control}></span>
            </div>
            <div className={styles.windowTitle}>Zecure ONE</div>
          </div>

          {/* Content Area - Reduced Padding */}
          <div className={styles.contentArea}>

            {/* Left Side - Text & Controls */}
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

              {/* Feature Showcase - Compact */}
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

              {/* Action Buttons */}
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

              {/* Stats - Inline */}
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

            {/* Right Side - Animation */}
            <div className={styles.rightSection}>
              <div className={styles.animationWrapper}>
                <Lottie
                  animationData={heroAnimation}
                  className={styles.heroAnimation}
                  loop={true}
                  autoplay={true}
                />

                {/* Floating Status Indicators */}
                {/* <div className={styles.statusIndicators}>
                  <div className={`${styles.indicator} ${styles.monitoring}`}>
                    <div className={styles.indicatorDot}></div>
                    <span>Real-time Monitoring</span>
                  </div>
                  <div className={`${styles.indicator} ${styles.secure}`}>
                    <div className={styles.indicatorDot}></div>
                    <span>Active Shield</span>
                  </div>
                  <div className={`${styles.indicator} ${styles.scanning}`}>
                    <div className={styles.indicatorDot}></div>
                    <span>Threat Hunting</span>
                  </div>
                </div> */}

              </div>
            </div>

          </div>
        </div>

        {/* Bottom Navigation - Updated with Icons */}
        <div className={`${styles.bottomNav} ${isVisible ? styles.fadeIn : ''}`}>
          <div className={styles.navItem}>
            <span className={styles.navIcon}>
              <HomeIcon />
            </span>
            <span>Enterprise</span>
          </div>
          <div className={styles.navItem}>
            <span className={styles.navIcon}>
              <ChartIcon />
            </span>
            <span>Intelligence</span>
          </div>
          <div className={styles.navItem}>
            <span className={styles.navIcon}>
              <SettingsIcon />
            </span>
            <span>Configuration</span>
          </div>
          <div className={styles.navItem}>
            <span className={styles.navIcon}>
              <SecurityIcon />
            </span>
            <span>Defense</span>
          </div>
        </div>

      </div>
    </section>
  );
}
