'use client';
import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/components/Mod.module.scss';

interface Module {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

// Clean, refined icons
const FraudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 12l2 2 4-4"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5c0 1.66 4 3 9 3s9-1.34 9-3"/>
  </svg>
);

const ThreatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 3v18h18"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
    <circle cx="18.7" cy="8" r="1.5" fill="currentColor" opacity="0.3"/>
  </svg>
);

const BehavioralIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <path d="M12 17h.01"/>
    <circle cx="12" cy="12" r="10"/>
  </svg>
);

const ApiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const AuditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

const NetworkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M16 4h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/>
    <path d="M8 4H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/>
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
  </svg>
);

const EncryptionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <circle cx="12" cy="16" r="1"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function ModulesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-highlight modules
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveModule(prev => {
        const moduleIds = modules.map(m => m.id);
        const currentIndex = prev ? moduleIds.indexOf(prev) : -1;
        const nextIndex = (currentIndex + 1) % moduleIds.length;
        return moduleIds[nextIndex];
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isVisible]);

  const modules: Module[] = [
    // Top Row (4 cards)
    {
      id: 'fraud-detection',
      icon: <FraudIcon />,
      title: 'Fraud Detection',
      description: 'Advanced ML algorithms to identify fraudulent activities in real-time.',
      color: '#cc6666'
    },
    {
      id: 'threat-analysis',
      icon: <ThreatIcon />,
      title: 'Threat Analysis',
      description: 'Comprehensive threat intelligence and analysis tools.',
      color: '#cc9966'
    },
    {
      id: 'behavioral-ai',
      icon: <BehavioralIcon />,
      title: 'Behavioral AI',
      description: 'ML models that understand user behavior patterns.',
      color: '#99cc66'
    },
    {
      id: 'api-gateway',
      icon: <ApiIcon />,
      title: 'API Gateway',
      description: 'Secure API management with threat detection.',
      color: '#66b3cc'
    },
    // Bottom Row (4 cards)
    {
      id: 'audit-logs',
      icon: <AuditIcon />,
      title: 'Audit Logs',
      description: 'Comprehensive logging system for compliance.',
      color: '#9999cc'
    },
    {
      id: 'real-time-alerts',
      icon: <AlertIcon />,
      title: 'Real-time Alerts',
      description: 'Instant notifications for immediate response.',
      color: '#66a388'
    },
    {
      id: 'network-security',
      icon: <NetworkIcon />,
      title: 'Network Security',
      description: 'Advanced network protection and monitoring.',
      color: '#cc99cc'
    },
    {
      id: 'data-encryption',
      icon: <EncryptionIcon />,
      title: 'Data Encryption',
      description: 'End-to-end encryption for sensitive data.',
      color: '#99cccc'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className={styles.modulesSection}
    >
      <div className={styles.container}>
        
        {/* Header */}
        <header className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
          <div className={styles.badge}>Platform Modules</div>
          <h2 className={styles.title}>
            Security <span className={styles.titleAccent}>Modules</span>
          </h2>
          <p className={styles.subtitle}>
            Complete security toolkit with 8 AI-powered modules
          </p>
        </header>

        {/* Modules Grid - 2x4 Layout */}
        <div className={`${styles.modulesGrid} ${isVisible ? styles.visible : ''}`}>
          {modules.map((module, index) => (
            <div
              key={module.id}
              className={`${styles.moduleCard} ${
                activeModule === module.id ? styles.active : ''
              } ${hoveredModule === module.id ? styles.hovered : ''}`}
              style={{
                '--module-color': module.color,
                animationDelay: `${index * 0.08}s`
              } as React.CSSProperties}
              onMouseEnter={() => setHoveredModule(module.id)}
              onMouseLeave={() => setHoveredModule(null)}
            >
              {/* Background glow effect */}
              <div className={styles.cardGlow}></div>
              
              {/* Module content */}
              <div className={styles.moduleHeader}>
                <div className={styles.moduleIcon}>
                  {module.icon}
                </div>
              </div>
              
              <div className={styles.moduleContent}>
                <h3 className={styles.moduleTitle}>{module.title}</h3>
                <p className={styles.moduleDescription}>{module.description}</p>
              </div>

              {/* Status indicator */}
              <div className={styles.statusIndicator}>
                <div className={styles.statusDot}></div>
                <span className={styles.statusText}>Active</span>
              </div>
            </div>
          ))}
        </div>

        {/* Module Stats */}
        <div className={styles.moduleStats}>
          <div className={styles.stat}>
            <div className={styles.statNumber}>8</div>
            <div className={styles.statLabel}>Core Modules</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>99.9%</div>
            <div className={styles.statLabel}>Uptime</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>24/7</div>
            <div className={styles.statLabel}>Monitoring</div>
          </div>
        </div>
      </div>
    </section>
  );
}
