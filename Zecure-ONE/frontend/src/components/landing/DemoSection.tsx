'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/components/landing.module.scss';

export default function DemoSection() {
  const [metrics, setMetrics] = useState({
    threats: 1247,
    blocked: 98.7,
    scanned: 15234,
    alerts: 23
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        threats: prev.threats + Math.floor(Math.random() * 3),
        blocked: 98.7 + Math.random() * 0.3,
        scanned: prev.scanned + Math.floor(Math.random() * 50),
        alerts: prev.alerts + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="demo" className={styles.section}>
      <h2 className={styles.sectionTitle}>Live Security Dashboard</h2>
      <div className={styles.demoContainer}>
        <div className={styles.mockDashboard}>
          <div className={styles.dashboardHeader}>
            <h3 className={styles.headerTitle}>Zecure ONE Command Center</h3>
            <div className={styles.statusIndicator}>
              <div className={styles.pulse} />
              <span>System Active</span>
            </div>
          </div>
          
          <div className={styles.dashboardGrid}>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>Threats Detected</div>
              <div className={styles.metricValue}>{metrics.threats.toLocaleString()}</div>
              <div className={styles.metricChange}>↑ 12% from last hour</div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricLabel}>Success Rate</div>
              <div className={styles.metricValue}>{metrics.blocked.toFixed(1)}%</div>
              <div className={styles.metricChange}>↑ 0.3% from yesterday</div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricLabel}>Items Scanned</div>
              <div className={styles.metricValue}>{metrics.scanned.toLocaleString()}</div>
              <div className={styles.metricChange}>↑ 8% from last hour</div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricLabel}>Active Alerts</div>
              <div className={styles.metricValue}>{metrics.alerts}</div>
              <div className={styles.metricChange}>3 critical, 20 low</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
