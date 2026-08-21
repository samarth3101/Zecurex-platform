'use client';

import { useEffect, useState, useRef } from 'react';
import styles from '@/styles/components/OurModels.module.scss';

interface ArchitectureLayer {
  id: string;
  name: string;
  description: string;
  components: Component[];
  color: string;
  position: number;
}

interface Component {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'service' | 'database' | 'api' | 'frontend' | 'ai';
  status: 'active' | 'processing' | 'standby';
}

// Architecture-focused icons
const APIGatewayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const AIEngineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 6.34l1.41-1.41M16.25 16.25l1.41-1.41" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

const DatabaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const MicroserviceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const SecurityLayerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const LoadBalancerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v20M2 12h20" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

export default function ArchitectureVisualization() {
  const [mounted, setMounted] = useState(false);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const architectureLayers: ArchitectureLayer[] = [
    {
      id: 'presentation',
      name: 'Presentation Layer',
      description: 'User interfaces, dashboards, and client applications across web and mobile platforms',
      position: 1,
      color: '#00d4ff',
      components: [
        { id: 'web-dashboard', name: 'Web Dash', icon: <MicroserviceIcon />, type: 'frontend', status: 'active' },
        { id: 'mobile-app', name: 'Mobile App', icon: <MicroserviceIcon />, type: 'frontend', status: 'active' },
        { id: 'admin-panel', name: 'Admin Panel', icon: <MicroserviceIcon />, type: 'frontend', status: 'active' }
      ]
    },
    {
      id: 'api-gateway',
      name: 'API Gateway & Load Balancer',
      description: 'Intelligent traffic management, authentication, rate limiting, and request routing',
      position: 2,
      color: '#02c39a',
      components: [
        { id: 'api-gateway', name: 'API Gateway', icon: <APIGatewayIcon />, type: 'api', status: 'processing' },
        { id: 'load-balancer', name: 'Load Bal', icon: <LoadBalancerIcon />, type: 'service', status: 'active' }
      ]
    },
    {
      id: 'ai-core',
      name: 'AI Security Engine',
      description: 'Advanced machine learning models for threat detection, behavioral analysis, and predictive security',
      position: 3,
      color: '#ff6b47',
      components: [
        { id: 'threat-ai', name: 'Threat Detection AI', icon: <AIEngineIcon />, type: 'ai', status: 'processing' },
        { id: 'behavior-ai', name: 'Behavior Analysis', icon: <AIEngineIcon />, type: 'ai', status: 'active' },
        { id: 'prediction-ai', name: 'Predictive Engine', icon: <AIEngineIcon />, type: 'ai', status: 'active' }
      ]
    },
    {
      id: 'microservices',
      name: 'Microservices Layer',
      description: 'Distributed cloud-native services with auto-scaling, fault tolerance, and service mesh integration',
      position: 4,
      color: '#8b5cf6',
      components: [
        { id: 'auth-service', name: 'Auth Service', icon: <MicroserviceIcon />, type: 'service', status: 'active' },
        { id: 'monitoring', name: 'Monitoring', icon: <MicroserviceIcon />, type: 'service', status: 'processing' },
        { id: 'compliance', name: 'Compliance', icon: <MicroserviceIcon />, type: 'service', status: 'active' },
        { id: 'incident', name: 'Response', icon: <MicroserviceIcon />, type: 'service', status: 'active' }
      ]
    },
    {
      id: 'security',
      name: 'Security Infrastructure',
      description: 'End-to-end encryption, zero-trust architecture, and advanced key management protocols',
      position: 5,
      color: '#ffa500',
      components: [
        { id: 'encryption', name: 'Encryption Layer', icon: <SecurityLayerIcon />, type: 'service', status: 'active' },
        { id: 'key-mgmt', name: 'Key Management', icon: <SecurityLayerIcon />, type: 'service', status: 'active' }
      ]
    },
    {
      id: 'data',
      name: 'Data Layer',
      description: 'High-performance databases, data lakes, real-time analytics, and distributed caching systems',
      position: 6,
      color: '#06b6d4',
      components: [
        { id: 'primary-db', name: 'Primary DB', icon: <DatabaseIcon />, type: 'database', status: 'active' },
        { id: 'analytics-db', name: 'Analytics DB', icon: <DatabaseIcon />, type: 'database', status: 'active' },
        { id: 'cache', name: 'Redis Cache', icon: <DatabaseIcon />, type: 'database', status: 'active' }
      ]
    }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className={styles.architectureSection}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerBadge}>
            <span className={styles.badgeText}>System Architecture</span>
          </div>
          <h2 className={styles.title}>
            <span className={styles.accent}>Zecure</span> Platform Architecture
          </h2>
          <p className={styles.subtitle}>
            Enterprise-grade multi-layer security architecture with AI-powered threat detection,
            microservices orchestration, and real-time data processing capabilities
          </p>
        </div>

        {/* Architecture Visualization */}
        <div className={styles.architectureContainer} ref={containerRef}>

          {/* Always-Visible Data Flow Lines */}
          <svg className={styles.dataFlowSvg}>
            {architectureLayers.map((layer, index) => {
              if (index === architectureLayers.length - 1) return null;
              const currentY = 10 + (index * 90) + 45; // Center of current layer
              const nextY = 10 + ((index + 1) * 90); // Top of next layer
              return (
                <line
                  key={`flow-${index}`}
                  x1="50%"
                  y1={currentY}
                  x2="50%"
                  y2={nextY}
                  className={styles.dataFlow}
                  style={{ animationDelay: `${index * 0.2}s` }}
                />
              );
            })}
          </svg>

          {/* Architecture Layers - FINAL CORRECT POSITIONING */}
          {architectureLayers.map((layer, layerIndex) => (
            <div
              key={layer.id}
              className={`${styles.architectureLayer} ${activeLayer === layer.id ? styles.active : ''}`}
              style={{
                top: `${10 + (layerIndex * 10)}px`,
                animationDelay: `${layerIndex * 0.1}s`,
                // Use custom property with correct typing
                ['--layer-color' as any]: layer.color
              }}
              onMouseEnter={() => setActiveLayer(layer.id)}
              onMouseLeave={() => setActiveLayer(null)}
            >
              {/* Layer Header */}
              <div className={styles.layerHeader}>
                <div className={styles.layerTitleGroup}>
                  <h3 className={styles.layerName}>{layer.name}</h3>
                  <div className={styles.layerIndicator}>
                    <span className={styles.layerNumber}>{String(layerIndex + 1).padStart(2, '0')}</span>
                  </div>
                </div>
                <p className={styles.layerDescription}>{layer.description}</p>
              </div>

          {/* Components */}
          <div className={styles.componentsGrid}>
            {layer.components.map((component, compIndex) => (
              <div
                key={component.id}
                className={`${styles.component} ${styles[component.type]} ${styles[component.status]}`}
                style={{ animationDelay: `${compIndex * 0.1}s` }}
              >
                <div className={styles.componentIcon}>
                  {component.icon}
                </div>
                <span className={styles.componentName}>{component.name}</span>
                <div className={`${styles.statusIndicator} ${styles[component.status]}`} />
              </div>
            ))}
          </div>

          {/* Layer Glow */}
          <div className={styles.layerGlow} />
        </div>
            ))}
      </div>
    </div>
      </section >
    );
}
