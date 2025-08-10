'use client';

import { useEffect, useState, useRef } from 'react';
import styles from '@/styles/components/OurModels.module.scss';

interface ModuleData {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  position: 'left' | 'right';
}

// Clean, professional icons
const EngineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 6.34l1.41-1.41M16.25 16.25l1.41-1.41"/>
  </svg>
);

const ThreatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const AnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3v18h18"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
  </svg>
);

const CloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
  </svg>
);

const IdentityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const EndpointIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const NetworkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6"/>
    <path d="m5.64 7.05 4.95 4.95m4.95-4.95-4.95 4.95"/>
  </svg>
);

const ComplianceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
  </svg>
);

const AutomationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

export default function OurModels() {
  const [mounted, setMounted] = useState(false);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced platform modules with better color distribution
  const modules: ModuleData[] = [
    // Left Side Modules - Detection & Intelligence
    {
      id: 'threat-detection',
      name: 'Threat Detection',
      icon: <ThreatIcon />,
      description: 'AI-powered real-time threat identification and advanced persistent threat detection',
      color: '#ff6b7a',
      position: 'left'
    },
    {
      id: 'behavioral-analytics',
      name: 'Behavioral Analytics',
      icon: <AnalyticsIcon />,
      description: 'Advanced user behavior analysis and anomaly detection with machine learning',
      color: '#c084fc',
      position: 'left'
    },
    {
      id: 'network-monitoring',
      name: 'Network Monitoring',
      icon: <NetworkIcon />,
      description: 'Continuous network traffic analysis and intrusion detection systems',
      color: '#38bdf8',
      position: 'left'
    },
    {
      id: 'intelligent-automation',
      name: 'AI Automation',
      icon: <AutomationIcon />,
      description: 'Intelligent threat response automation and orchestrated security workflows',
      color: '#fb7185',
      position: 'left'
    },
    
    // Right Side Modules - Protection & Management
    {
      id: 'cloud-security',
      name: 'Cloud Security',
      icon: <CloudIcon />,
      description: 'Multi-cloud security orchestration and cloud workload protection platform',
      color: '#60a5fa',
      position: 'right'
    },
    {
      id: 'identity-protection',
      name: 'Identity Protection',
      icon: <IdentityIcon />,
      description: 'Zero-trust identity verification and privileged access management',
      color: '#fbbf24',
      position: 'right'
    },
    {
      id: 'endpoint-security',
      name: 'Endpoint Security',
      icon: <EndpointIcon />,
      description: 'Comprehensive endpoint detection and response with device protection',
      color: '#34d399',
      position: 'right'
    },
    {
      id: 'compliance-management',
      name: 'Compliance',
      icon: <ComplianceIcon />,
      description: 'Automated regulatory compliance management and governance frameworks',
      color: '#a78bfa',
      position: 'right'
    }
  ];

  // Balanced aesthetic positioning algorithm
  const calculatePositions = () => {
    if (!containerRef.current) return [];
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    const leftModules = modules.filter(m => m.position === 'left');
    const rightModules = modules.filter(m => m.position === 'right');
    
    const positions: Array<{x: number, y: number}> = [];
    
    // Balanced spacing for left side modules (reduced from previous)
    const leftRadius = Math.min(containerWidth * 0.36, containerHeight * 0.38); // Reduced from 0.42
    const leftTotalHeight = containerHeight * 0.65; // Reduced from 0.8
    const leftSpacing = leftTotalHeight / Math.max(leftModules.length - 1, 1);
    const leftStartY = centerY - (leftTotalHeight / 2);
    
    leftModules.forEach((_, index) => {
      const y = leftStartY + (leftSpacing * index);
      const x = centerX - leftRadius;
      positions.push({ x, y });
    });
    
    // Balanced spacing for right side modules (reduced from previous)
    const rightRadius = Math.min(containerWidth * 0.36, containerHeight * 0.38); // Reduced from 0.42
    const rightTotalHeight = containerHeight * 0.65; // Reduced from 0.8
    const rightSpacing = rightTotalHeight / Math.max(rightModules.length - 1, 1);
    const rightStartY = centerY - (rightTotalHeight / 2);
    
    rightModules.forEach((_, index) => {
      const y = rightStartY + (rightSpacing * index);
      const x = centerX + rightRadius;
      positions.push({ x, y });
    });
    
    return positions;
  };

  const [positions, setPositions] = useState<Array<{x: number, y: number}>>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const updatePositions = () => {
        setPositions(calculatePositions());
      };
      
      updatePositions();
      
      let timeoutId: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(updatePositions, 100);
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timeoutId);
      };
    }
  }, [mounted]);

  if (!mounted) return null;

  return (
    <section className={styles.ourModels}>
      <div className={styles.container}>
        
        {/* Enhanced Header */}
        <div className={styles.header}>
          <div className={styles.headerBadge}>
            <span className={styles.badgeText}>Platform Architecture</span>
          </div>
          <h2 className={styles.title}>
            <span className={styles.accent}>Zecure Platform</span> Ecosystem
          </h2>
          <p className={styles.subtitle}>
            AI-powered cybersecurity modules orchestrated by the central Zecure Engine
          </p>
        </div>

        {/* Enhanced Network Visualization */}
        <div className={styles.networkContainer} ref={containerRef}>
          
          {/* Connection Lines */}
          <svg className={styles.connectionsSvg}>
            {positions.map((position, index) => (
              <line
                key={`connection-${index}`}
                x1="50%"
                y1="50%"
                x2={position.x}
                y2={position.y}
                className={`${styles.connection} ${styles[modules[index].position]} ${hoveredModule === modules[index].id ? styles.active : ''}`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  stroke: hoveredModule === modules[index].id ? modules[index].color : undefined
                }}
              />
            ))}
          </svg>



          {/* Center Node - Enhanced Zecure Engine */}
          <div className={styles.centerNode}>
            <div className={styles.centerInner}>
              <div className={styles.centerIcon}>
                <EngineIcon />
              </div>
              <div className={styles.centerLabel}>
                Zecure Engine
              </div>
              <div className={styles.centerSubtitle}>
                AI Core
              </div>
            </div>
            <div className={styles.pulseRing}></div>
            <div className={styles.outerRing}></div>
          </div>

          {/* Module Nodes */}
          {modules.map((module, index) => {
            const position = positions[index];
            if (!position) return null;

            return (
              <div
                key={module.id}
                className={`${styles.moduleNode} ${styles[module.position]} ${hoveredModule === module.id ? styles.hovered : ''}`}
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${index * 0.2}s`,
                  '--module-color': module.color
                } as React.CSSProperties}
                onMouseEnter={() => setHoveredModule(module.id)}
                onMouseLeave={() => setHoveredModule(null)}
              >
                <div 
                  className={styles.moduleInner}
                  style={{ 
                    borderColor: hoveredModule === module.id ? module.color : undefined
                  }}
                >
                  <div 
                    className={styles.moduleIcon}
                    style={{ color: module.color }}
                  >
                    {module.icon}
                  </div>
                  <div className={styles.moduleLabel}>
                    {module.name}
                  </div>
                </div>

                {/* Fixed Tooltip with proper pointing */}
                {hoveredModule === module.id && (
                  <div className={`${styles.tooltip} ${styles[module.position]}`}>
                    <div className={styles.tooltipContent}>
                      <div className={styles.tooltipHeader}>
                        <div 
                          className={styles.tooltipIcon}
                          style={{ color: module.color }}
                        >
                          {module.icon}
                        </div>
                        <h4 className={styles.tooltipTitle}>{module.name}</h4>
                      </div>
                      <p className={styles.tooltipDescription}>{module.description}</p>
                    </div>
                    <div className={styles.tooltipArrow}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Enhanced Stats */}
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>8</div>
            <div className={styles.statLabel}>Security Modules</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>24/7</div>
            <div className={styles.statLabel}>AI Monitoring</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>&lt;1ms</div>
            <div className={styles.statLabel}>Response Time</div>
          </div>
        </div>

      </div>
    </section>
  );
}
