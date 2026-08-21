'use client';

import { useEffect, useState, useCallback } from 'react';
import Lottie from 'lottie-react';
import Button from '@/components/common/Button';
import styles from '@/styles/components/Hero.module.scss';

// Direct import of JSON animation
import heroAnimation from '@/assets/animations/hero.json';

interface HeroSectionProps {
  isVisible?: boolean;
}

// SVG Icons Components
const WebIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const ExtIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <polyline points="9,9 9,15 15,15"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
  </svg>
);

const CliIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <path d="m9 9 3 3-3 3"/>
    <path d="m15 15h-6"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.41 8.84L12 13.42l4.59-4.58L18 10.25l-6 6-6-6z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

export default function HeroSection({ isVisible = false }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeDevice, setActiveDevice] = useState('Web');
  const [animatedStats, setAnimatedStats] = useState({
    uptime: 0,
    monitoring: '24/7',
    aiPowered: 'AI'
  });

  const deviceOptions = [
    { id: 'Web', label: 'Web', icon: <WebIcon /> },
    { id: 'Ext', label: 'Ext', icon: <ExtIcon /> },
    { id: 'CLI', label: 'CLI', icon: <CliIcon /> }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animated counters for stats
  useEffect(() => {
    if (isVisible) {
      const uptimeTimer = setInterval(() => {
        setAnimatedStats(prev => {
          if (prev.uptime < 99.9) {
            return { ...prev, uptime: Math.min(prev.uptime + 2.5, 99.9) };
          }
          clearInterval(uptimeTimer);
          return prev;
        });
      }, 50);

      return () => {
        clearInterval(uptimeTimer);
      };
    }
  }, [isVisible]);

  const handleScrollToNext = useCallback(() => {
    const nextSection = document.querySelector('section:nth-of-type(2)') || 
                       document.getElementById('demo') || 
                       document.getElementById('features');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleVideoModalClose = useCallback(() => {
    setShowVideoModal(false);
  }, []);

  const handleVideoModalOpen = useCallback(() => {
    setShowVideoModal(true);
  }, []);

  const handleGetStarted = useCallback(() => {
    window.location.href = '/register';
  }, []);

  const handleDeviceChange = useCallback((deviceId: string) => {
    setActiveDevice(deviceId);
  }, []);

  if (!mounted) return null;

  return (
    <section className={styles.hero}>
      {/* Animated Background Layer */}
      <div className={styles.animatedBackground}>
        <div className={styles.gridLines}></div>
        <div className={styles.floatingParticles}>
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={styles.particle} 
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className={styles.container}>
        {/* Left Panel - Hero Content */}
        <div className={styles.leftPanel}>
          <div className={`${styles.content} ${isVisible ? styles.slideIn : ''}`}>
            <div className={styles.badge}>
              <span className={styles.badgeText}>AI Security</span>
            </div>

            <h1 className={styles.mainHeading}>
              AI Security.<br />
              <span className={`${styles.accent} ${isVisible ? styles.typewriter : ''}`}>
                Redefined.
              </span>
            </h1>

            {/* Enhanced Value Proposition */}
            <div className={styles.valueProps}>
              <p className={styles.primaryValue}>
                AI that protects you in real-time, 24/7, before threats even strike.
              </p>
              <p className={styles.description}>
                Traditional security wasn't built for the AI age. <span className={styles.accent}>Zecure ONE</span> uses 
                state-of-the-art artificial intelligence to continuously monitor and protect your digital world.
              </p>
            </div>

            <div className={styles.buttons}>
              {/* <Button
                size="lg"
                className={styles.demoButton}
                onClick={handleVideoModalOpen}
                aria-label="Watch 30 second demo video"
              >
                Watch 30s Demo
                <PlayIcon />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className={styles.auroraButton}
                onClick={handleGetStarted}
                aria-label="Get started with Zecure ONE"
              >
                Learn More
              </Button> */}
            </div>

            {/* Compact Stats and Social Proof Row */}
            <div className={styles.statsAndProof}>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{animatedStats.monitoring}</span>
                  <span className={styles.statLabel}>Monitoring</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>
                    {animatedStats.uptime < 99.9 ? animatedStats.uptime.toFixed(1) : '99.9'}%
                  </span>
                  <span className={styles.statLabel}>Uptime</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{animatedStats.aiPowered}</span>
                  <span className={styles.statLabel}>Powered</span>
                </div>
              </div>

              {/* Compact Social Proof */}
              <div className={styles.socialProof}>
                <div className={styles.trustSection}>
                  <div className={styles.trustBadge}>
                    <span className={styles.trustNumber}>1,000+</span>
                    <span className={styles.trustLabel}>Users</span>
                  </div>
                  <div className={styles.complianceBadges}>
                    <span className={styles.complianceBadge}>ISO 27001</span>
                    <span className={styles.complianceBadge}>SOC2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Enhanced Lottie Animation */}
        <div className={styles.rightPanel}>
          <div className={`${styles.visualContainer} ${isVisible ? styles.fadeIn : ''}`}>
            {/* Functional Device Preview Toggle */}
            <div className={styles.devicePreview}>
              <div className={styles.deviceTabs} role="tablist" aria-label="Device options">
                {deviceOptions.map((device) => (
                  <button 
                    key={device.id}
                    className={`${styles.deviceTab} ${activeDevice === device.id ? styles.active : ''}`}
                    onClick={() => handleDeviceChange(device.id)}
                    role="tab"
                    aria-selected={activeDevice === device.id}
                    aria-controls={`device-panel-${device.id}`}
                    tabIndex={activeDevice === device.id ? 0 : -1}
                  >
                    <span className={styles.deviceIcon} aria-hidden="true">
                      {device.icon}
                    </span>
                    {device.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Lottie Animation Container */}
            <div className={styles.animationContainer}>
              <Lottie
                animationData={heroAnimation}
                className={`${styles.lottieAnimation} ${isVisible ? styles.parallaxEffect : ''}`}
                loop={true}
                autoplay={true}
                aria-label="Zecure ONE security animation"
              />
            </div>

            {/* Enhanced status indicators with micro-interactions */}
            <div className={styles.statusIndicators} role="list" aria-label="Security status indicators">
              <div className={`${styles.indicator} ${styles.secure}`} role="listitem">
                <div className={styles.indicatorDot} aria-hidden="true"></div>
                <span>Secure</span>
              </div>
              <div className={`${styles.indicator} ${styles.monitoring} ${styles.pulsingIndicator}`} role="listitem">
                <div className={styles.indicatorDot} aria-hidden="true"></div>
                <span>Monitoring</span>
              </div>
              <div className={`${styles.indicator} ${styles.protected}`} role="listitem">
                <div className={styles.indicatorDot} aria-hidden="true"></div>
                <span>Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Scroll Cue */}
      <button 
        className={styles.scrollCue} 
        onClick={handleScrollToNext}
        aria-label="Scroll to next section"
        type="button"
      >
        <ChevronDownIcon />
      </button>

      {/* Video Modal */}
      {showVideoModal && (
        <div 
          className={styles.videoModal} 
          onClick={handleVideoModalClose}
          role="dialog" 
          aria-modal="true"
          aria-labelledby="video-modal-title"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={handleVideoModalClose}
              aria-label="Close video modal"
              type="button"
            >
              <CloseIcon />
            </button>
            <div className={styles.videoPlaceholder}>
              <div className={styles.playButton} aria-hidden="true">
                <PlayIcon />
              </div>
              <h2 id="video-modal-title">Zecure ONE Demo</h2>
              <p>Experience AI Security in Action</p>
              <small>Coming Soon</small>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
