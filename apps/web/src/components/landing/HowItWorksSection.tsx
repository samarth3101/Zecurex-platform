'use client';
import { useState, useEffect } from 'react';
import styles from '@/styles/components/HowItWorks.module.scss';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// Clean icons
const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const AnalyzeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 3v18h18"/>
    <path d="M18 8l-4 4-3-3-4 4"/>
  </svg>
);

const DetectIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const ProtectIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <circle cx="12" cy="16" r="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [glowPhase, setGlowPhase] = useState(0);

  // Auto-progress through steps
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(stepInterval);
  }, []);

  // Periodic glow
  useEffect(() => {
    const glowInterval = setInterval(() => {
      setGlowPhase((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(glowInterval);
  }, []);

  const steps: Step[] = [
    {
      id: 'monitor',
      title: 'Monitor',
      description: 'Continuous 24/7 monitoring of user activities, network traffic, and system interactions',
      icon: <MonitorIcon />,
      color: '#cc6666' // Dulled red
    },
    {
      id: 'analyze',
      title: 'Analyze',
      description: 'Advanced AI algorithms analyze behavioral patterns and detect anomalies using ML',
      icon: <AnalyzeIcon />,
      color: '#cc9966' // Dulled orange-red
    },
    {
      id: 'detect',
      title: 'Detect',
      description: 'Identify potential threats, security vulnerabilities, and malicious activities instantly',
      icon: <DetectIcon />,
      color: '#99cc66' // Dulled yellow-green
    },
    {
      id: 'protect',
      title: 'Protect',
      description: 'Automatically block threats, isolate systems, and notify security teams in real-time',
      icon: <ProtectIcon />,
      color: ''
    }
  ];

  return (
    <section className={styles.howItWorksSection}>
      <div className={styles.container}>
        
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.badge}>Intelligence Process</div>
          <h2 className={styles.title}>
            How <span className={styles.titleAccent}>Zecure</span> Protects You
          </h2>
          <p className={styles.subtitle}>
            Four intelligent phases working in perfect harmony
            <br />to defend your digital infrastructure
          </p>
        </header>

        {/* Steps Grid */}
        <div className={styles.stepsGrid}>
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`${styles.stepCard} ${
                index <= activeStep ? styles.active : ''
              } ${index === activeStep ? styles.current : ''} ${
                glowPhase === index ? styles.glowing : ''
              } ${index === 3 ? styles.zecureCard : ''}`}
              style={{
                borderColor: index === 3 ? 'transparent' : step.color,
                borderWidth: index <= activeStep ? '3px' : '2px',
                animationDelay: `${index * 0.15}s`
              }}
            >
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
              
              {/* Flow connector */}
              {index < steps.length - 1 && (
                <div className={styles.flowConnector}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14m-7-7 7 7-7 7"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
