'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/components/FeaturesSection.module.scss';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  stats: {
    value: string;
    label: string;
  };
  benefits: string[];
}

// Premium Security Icons
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
    <circle cx="12" cy="8" r="1"/>
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6"/>
    <path d="M12 17v6"/>
  </svg>
);

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.64z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.64z"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const ZapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    <circle cx="12" cy="12" r="1"/>
  </svg>
);

const NetworkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M16 3h5v5"/>
    <path d="M8 3H3v5"/>
    <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/>
    <path d="M21 3l-7.828 7.828A4 4 0 0 0 12 13.657V22"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <path d="M9 9h6v6H9z"/>
    <path d="M9 3v6"/>
    <path d="M15 3v6"/>
    <path d="M9 15v6"/>
    <path d="M15 15v6"/>
  </svg>
);

// Animated Number Component
const AnimatedNumber = ({ value, suffix = '', duration = 2000 }: {
  value: number;
  suffix?: string;
  duration?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(value * easeOut));
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [isVisible, value, duration]);

  return (
    <div ref={ref} className={styles.animatedNumber}>
      {displayValue.toLocaleString()}{suffix}
    </div>
  );
};

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features: Feature[] = [
    {
      id: 'ai-detection',
      title: 'AI-Powered Threat Detection',
      description: 'Advanced machine learning identifies zero-day attacks & anomalous behavior patterns traditional security misses.',
      icon: <ShieldIcon />,
      color: '#00d4ff',
      stats: { value: '99.7%', label: 'Detection Rate' },
      benefits: ['Zero-day threat identification', 'Behavioral anomaly detection', 'Real-time pattern analysis']
    },
    {
      id: 'realtime-monitoring',
      title: 'Real-Time Monitoring',
      description: 'Continuous 24/7 surveillance of all endpoints, networks, and user activities with instant threat response.',
      icon: <EyeIcon />,
      color: '#02c39a',
      stats: { value: '24/7', label: 'Active Monitoring' },
      benefits: ['Continuous endpoint surveillance', 'Network traffic analysis', 'User behavior tracking']
    },
    {
      id: 'predictive-intelligence',
      title: 'Predictive Intelligence',
      description: 'Forecast security risks and vulnerabilities before they become breaches using advanced AI algorithms.',
      icon: <BrainIcon />,
      color: '#ff6b47',
      stats: { value: '87%', label: 'Risk Prediction' },
      benefits: ['Future threat forecasting', 'Vulnerability assessment', 'Risk probability scoring']
    },
    {
      id: 'automated-response',
      title: 'Automated Response',
      description: 'Instant threat neutralization and system isolation without human intervention or delay.',
      icon: <ZapIcon />,
      color: '#ffa500',
      stats: { value: '<50ms', label: 'Response Time' },
      benefits: ['Automatic threat blocking', 'System isolation protocols', 'Self-healing networks']
    },
    {
      id: 'seamless-integration',
      title: 'Seamless Integration',
      description: 'Works with existing infrastructure, APIs, and cloud platforms without disrupting operations.',
      icon: <NetworkIcon />,
      color: '#8b5cf6',
      stats: { value: '500+', label: 'Integrations' },
      benefits: ['API-first architecture', 'Cloud-native design', 'Legacy system support']
    },
    {
      id: 'smart-analytics',
      title: 'Smart Analytics Dashboard',
      description: 'Clear, actionable insights with executive-level reporting and real-time security metrics.',
      icon: <DashboardIcon />,
      color: '#06b6d4',
      stats: { value: '95%', label: 'Clarity Score' },
      benefits: ['Executive dashboards', 'Custom reporting', 'Compliance tracking']
    }
  ];

  // Auto-cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className={styles.featuresSection}>
      <div className={styles.container}>
        
        {/* Premium Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            Next-Generation Security
          </div>
          <h2 className={styles.title}>
            Intelligent Security. <span className={styles.titleAccent}>Built Different.</span>
          </h2>
          <p className={styles.subtitle}>
            Zecure ONE combines deep learning, real-time monitoring, and predictive intelligence 
            to keep you <strong>one step ahead</strong> of every threat in the digital landscape.
          </p>
        </div>

        {/* Interactive Features Grid */}
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`${styles.featureCard} ${
                index === activeFeature ? styles.active : ''
              } ${hoveredFeature === index ? styles.hovered : ''}`}
              onMouseEnter={() => {
                setHoveredFeature(index);
                setActiveFeature(index);
              }}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{
                animationDelay: `${index * 100}ms`,
                '--feature-color': feature.color
              } as React.CSSProperties}
            >
              {/* Card Background Effect */}
              <div className={styles.cardBackground} />
              
              {/* Feature Header */}
              <div className={styles.featureHeader}>
                <div className={styles.iconContainer}>
                  <div className={styles.iconBackground} />
                  <div className={styles.featureIcon}>
                    {feature.icon}
                  </div>
                  {index === activeFeature && (
                    <div className={styles.activeIndicator} />
                  )}
                </div>
                <div className={styles.statsContainer}>
                  <div className={styles.statValue}>
                    {feature.stats.value.includes('%') ? (
                      <AnimatedNumber 
                        value={parseFloat(feature.stats.value)} 
                        suffix="%" 
                      />
                    ) : (
                      feature.stats.value
                    )}
                  </div>
                  <div className={styles.statLabel}>{feature.stats.label}</div>
                </div>
              </div>

              {/* Feature Content */}
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
                
                {/* Benefits List */}
                <div className={styles.benefitsList}>
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className={styles.benefit}>
                      <span className={styles.benefitIcon}>✓</span>
                      <span className={styles.benefitText}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{
                    width: index <= activeFeature ? '100%' : '0%',
                    backgroundColor: feature.color
                  }}
                />
              </div>

              {/* Hover Glow */}
              <div className={styles.cardGlow} />
            </div>
          ))}
        </div>

        {/* Feature Navigator */}
        <div className={styles.featureNavigator}>
          {features.map((feature, index) => (
            <button
              key={feature.id}
              className={`${styles.navButton} ${
                index === activeFeature ? styles.active : ''
              }`}
              onClick={() => setActiveFeature(index)}
              style={{ '--nav-color': feature.color } as React.CSSProperties}
            >
              <span className={styles.navIcon}>{feature.icon}</span>
              <span className={styles.navLabel}>{feature.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
