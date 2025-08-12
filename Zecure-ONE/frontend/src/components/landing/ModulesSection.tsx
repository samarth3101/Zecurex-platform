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

// Updated icons for the new modules
const CloudSecurityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 0 1 0 9Z"/>
    <path d="M12 12v6"/>
    <path d="M16 16l-4-4-4 4"/>
  </svg>
);

const FraudPreventionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
    <circle cx="12" cy="8" r="3" fill="none"/>
  </svg>
);

const ThreatIntelligenceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
    <path d="M16 8l-4 4-2-2"/>
  </svg>
);

const IncidentResponseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    <circle cx="12" cy="9" r="1"/>
  </svg>
);

const PolicyEngineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <path d="M16 13H8"/>
    <path d="M16 17H8"/>
    <path d="M10 9H8"/>
  </svg>
);

const AttackPlaygroundIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    <circle cx="15" cy="9" r="1"/>
  </svg>
);

const DeveloperAPIIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
    <line x1="12" y1="2" x2="12" y2="22"/>
  </svg>
);

const AuditDashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 9h6v6H9z"/>
    <path d="M9 3v2"/>
    <path d="M15 3v2"/>
    <path d="M9 19v2"/>
    <path d="M15 19v2"/>
    <path d="M3 9h2"/>
    <path d="M3 15h2"/>
    <path d="M19 9h2"/>
    <path d="M19 15h2"/>
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
      id: 'cloud-security',
      icon: <CloudSecurityIcon />,
      title: 'Real-Time Cloud Security',
      description: 'Continuous monitoring and protection for cloud infrastructure and services.',
      color: '#cc6666'
    },
    {
      id: 'fraud-prevention',
      icon: <FraudPreventionIcon />,
      title: 'AI-Powered Fraud Prevention',
      description: 'Advanced machine learning algorithms to detect and prevent fraudulent activities.',
      color: '#cc9966'
    },
    {
      id: 'threat-intelligence',
      icon: <ThreatIntelligenceIcon />,
      title: 'Advanced Threat Intelligence',
      description: 'Comprehensive threat analysis covering phishing and LLM security.',
      color: '#99cc66'
    },
    {
      id: 'incident-response',
      icon: <IncidentResponseIcon />,
      title: 'Automated Incident Response',
      description: 'Intelligent orchestration and event-driven security response system.',
      color: '#66b3cc'
    },
    // Bottom Row (4 cards)
    {
      id: 'policy-engine',
      icon: <PolicyEngineIcon />,
      title: 'Security Policy & Compliance Engine',
      description: 'Automated policy management and compliance monitoring system.',
      color: '#9999cc'
    },
    {
      id: 'attack-playground',
      icon: <AttackPlaygroundIcon />,
      title: 'Attack Simulation & Testing Playground',
      description: 'Safe environment for security testing and attack simulation scenarios.',
      color: '#66a388'
    },
    {
      id: 'developer-api',
      icon: <DeveloperAPIIcon />,
      title: 'Developer API & Integration Hub',
      description: 'Comprehensive API suite for seamless security integration and development.',
      color: '#cc99cc'
    },
    {
      id: 'audit-dashboard',
      icon: <AuditDashboardIcon />,
      title: 'Audit & Analytics Dashboard',
      description: 'Advanced metrics, logging, and analytical insights for security operations.',
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
          <div className={styles.badge}>Security Platform</div>
          <h2 className={styles.title}>
            Zecure <span className={styles.titleAccent}>Security</span> Platforms
          </h2>
          <p className={styles.subtitle}>
            Comprehensive security ecosystem with 8 integrated modules
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
            <div className={styles.statLabel}>Platform Modules</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>99.9%</div>
            <div className={styles.statLabel}>Reliability</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>24/7</div>
            <div className={styles.statLabel}>Protection</div>
          </div>
        </div>
      </div>
    </section>
  );
}
