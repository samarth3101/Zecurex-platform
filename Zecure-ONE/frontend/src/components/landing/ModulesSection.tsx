'use client';
import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/components/Mod.module.scss';

interface Module {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  category: string;
  status: 'active' | 'beta' | 'coming-soon';
}

// Module icons
const CloudSecurityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 0 1 0 9Z"/>
    <path d="M12 12v6"/>
    <path d="M16 16l-4-4-4 4"/>
  </svg>
);

const FraudPreventionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
    <circle cx="12" cy="8" r="2" fill="none"/>
  </svg>
);

const ThreatIntelligenceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
    <path d="M16 8l-4 4-2-2"/>
  </svg>
);

const IncidentResponseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    <circle cx="12" cy="9" r="1"/>
  </svg>
);

const PolicyEngineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <path d="M16 13H8"/>
    <path d="M16 17H8"/>
  </svg>
);

const AttackPlaygroundIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

const DeveloperAPIIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
    <line x1="12" y1="2" x2="12" y2="22"/>
  </svg>
);

const AuditDashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 9h6v6H9z"/>
    <path d="M9 3v2"/>
    <path d="M15 3v2"/>
    <path d="M9 19v2"/>
    <path d="M15 19v2"/>
  </svg>
);

// Stats section icons
const SecurityModulesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const ThreatDetectionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const ActiveMonitoringIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
    <path d="M2 12h4"/>
    <path d="M18 12h4"/>
    <path d="M12 2v4"/>
    <path d="M12 18v4"/>
  </svg>
);

const ResponseTimeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
    <path d="m9 9 6 6"/>
    <path d="m15 9-6 6"/>
  </svg>
);

// Enterprise Security Platform Icon
const EnterpriseSecurityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M12 8v8"/>
    <path d="M8 12h8"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = '', duration = 1500 }: {
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
      { threshold: 0.5 }
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

  return <div ref={ref}>{displayValue.toLocaleString()}{suffix}</div>;
};

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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Smart auto-highlight with smooth transitions
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveModule(prev => {
        const moduleIds = modules.map(m => m.id);
        const currentIndex = prev ? moduleIds.indexOf(prev) : -1;
        const nextIndex = (currentIndex + 1) % moduleIds.length;
        return moduleIds[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const modules: Module[] = [
    // Top Row - Core Security
    {
      id: 'cloud-security',
      icon: <CloudSecurityIcon />,
      title: 'Cloud Security Suite',
      description: 'Real-time monitoring and protection for multi-cloud infrastructure with automated threat detection.',
      color: '#00d4ff',
      category: 'CORE SECURITY',
      status: 'active'
    },
    {
      id: 'fraud-prevention',
      icon: <FraudPreventionIcon />,
      title: 'AI Fraud Prevention',
      description: 'Machine learning algorithms for real-time fraud detection and prevention across all channels.',
      color: '#02c39a',
      category: 'CORE SECURITY',
      status: 'active'
    },
    {
      id: 'threat-intelligence',
      icon: <ThreatIntelligenceIcon />,
      title: 'Threat Intelligence Hub',
      description: 'Advanced threat analysis covering phishing, malware, and emerging security vulnerabilities.',
      color: '#ff6b47',
      category: 'INTELLIGENCE',
      status: 'active'
    },
    {
      id: 'incident-response',
      icon: <IncidentResponseIcon />,
      title: 'Incident Response Center',
      description: 'Automated incident orchestration with intelligent event-driven security response protocols.',
      color: '#ffa500',
      category: 'RESPONSE',
      status: 'active'
    },
    // Bottom Row - Management & Tools
    {
      id: 'policy-engine',
      icon: <PolicyEngineIcon />,
      title: 'Policy & Compliance',
      description: 'Automated security policy management with real-time compliance monitoring and reporting.',
      color: '#8b5cf6',
      category: 'GOVERNANCE',
      status: 'active'
    },
    {
      id: 'attack-playground',
      icon: <AttackPlaygroundIcon />,
      title: 'Security Testing Lab',
      description: 'Safe environment for penetration testing, red team exercises, and attack simulation scenarios.',
      color: '#06b6d4',
      category: 'TESTING',
      status: 'beta'
    },
    {
      id: 'developer-api',
      icon: <DeveloperAPIIcon />,
      title: 'Developer Integration',
      description: 'Comprehensive API suite for seamless security integration with existing development workflows.',
      color: '#34d399',
      category: 'DEVELOPMENT',
      status: 'active'
    },
    {
      id: 'audit-dashboard',
      icon: <AuditDashboardIcon />,
      title: 'Analytics & Insights',
      description: 'Executive dashboards with advanced metrics, logging, and predictive security analytics.',
      color: '#f59e0b',
      category: 'ANALYTICS',
      status: 'active'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className={styles.modulesSection}
    >
      <div className={styles.container}>
        
        {/* Updated Header with Icon */}
        <header className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
          <div className={styles.badge}>
            <span className={styles.badgeText}>Enterprise Security Platform</span>
          </div>
          <h2 className={styles.title}>
            Complete <span className={styles.titleAccent}>Security</span> Ecosystem
          </h2>
          <p className={styles.subtitle}>
            Eight integrated security modules providing comprehensive protection, 
            from threat detection to compliance management—all powered by advanced AI.
          </p>
        </header>

        {/* Clean Modules Grid */}
        <div className={`${styles.modulesGrid} ${isVisible ? styles.visible : ''}`}>
          {modules.map((module, index) => (
            <article
              key={module.id}
              className={`${styles.moduleCard} ${
                activeModule === module.id ? styles.active : ''
              } ${hoveredModule === module.id ? styles.hovered : ''}`}
              style={{
                '--module-color': module.color,
                '--animation-delay': `${index * 0.1}s`
              } as React.CSSProperties}
              onMouseEnter={() => setHoveredModule(module.id)}
              onMouseLeave={() => setHoveredModule(null)}
            >
              {/* Clean Background Effects */}
              <div className={styles.cardBackground} />
              <div className={styles.cardGlow} />
              
              {/* Module Header with Status */}
              <header className={styles.moduleHeader}>
                <div className={styles.moduleIconContainer}>
                  <div className={styles.moduleIcon}>
                    {module.icon}
                  </div>
                  <div className={styles.iconGlow} />
                </div>
                
                <div className={styles.moduleMetadata}>
                  <span className={styles.moduleCategory}>{module.category}</span>
                  <div className={`${styles.statusBadge} ${styles[module.status]}`}>
                    {module.status === 'active' && '●'}
                    {module.status === 'beta' && '◐'}
                    {module.status === 'coming-soon' && '○'}
                    <span>{module.status.replace('-', ' ')}</span>
                  </div>
                </div>
              </header>
              
              {/* Module Content */}
              <div className={styles.moduleContent}>
                <h3 className={styles.moduleTitle}>{module.title}</h3>
                <p className={styles.moduleDescription}>{module.description}</p>
              </div>

              {/* Connection Indicator Only */}
              <footer className={styles.moduleFooter}>
                <div className={styles.connectionIndicator}>
                  <div className={styles.connectionDot} />
                  <div className={styles.connectionDot} />
                  <div className={styles.connectionDot} />
                </div>
              </footer>
            </article>
          ))}
        </div>

        {/* Updated Stats with SVG Icons */}
        {/* <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SecurityModulesIcon />
              </div>
              <div className={styles.statValue}>
                <AnimatedCounter value={8} />
              </div>
              <div className={styles.statLabel}>Security Modules</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <ThreatDetectionIcon />
              </div>
              <div className={styles.statValue}>
                <AnimatedCounter value={99} suffix="%" />
              </div>
              <div className={styles.statLabel}>Threat Detection</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <ActiveMonitoringIcon />
              </div>
              <div className={styles.statValue}>
                <AnimatedCounter value={24} suffix="/7" />
              </div>
              <div className={styles.statLabel}>Active Monitoring</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <ResponseTimeIcon />
              </div>
              <div className={styles.statValue}>
                <AnimatedCounter value={50} suffix="ms" />
              </div>
              <div className={styles.statLabel}>Response Time</div>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}
