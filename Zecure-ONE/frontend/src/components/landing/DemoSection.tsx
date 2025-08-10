'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/components/Demo.module.scss';

interface MetricData {
  threats: number;
  blocked: number;
  scanned: number;
  alerts: number;
}

interface ChartData {
  time: string;
  threats: number;
  scanned: number;
}

interface ActivityItem {
  id: string;
  type: 'threat' | 'scan' | 'alert' | 'block';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function DemoSection() {
  const [metrics, setMetrics] = useState<MetricData>({
    threats: 1247,
    blocked: 98.7,
    scanned: 15234,
    alerts: 23
  });

  const [chartData, setChartData] = useState<ChartData[]>([
    { time: '12:00', threats: 45, scanned: 1200 },
    { time: '12:15', threats: 52, scanned: 1350 },
    { time: '12:30', threats: 38, scanned: 1100 },
    { time: '12:45', threats: 67, scanned: 1450 },
    { time: '13:00', threats: 71, scanned: 1520 },
  ]);

  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: '1', type: 'threat', message: 'Malware detected in email', timestamp: '2m', severity: 'critical' },
    { id: '2', type: 'block', message: 'Suspicious IP blocked', timestamp: '5m', severity: 'high' },
    { id: '3', type: 'scan', message: '1.2K files scanned', timestamp: '8m', severity: 'low' },
  ]);

  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        threats: prev.threats + Math.floor(Math.random() * 3),
        blocked: Math.min(99.9, 98.7 + Math.random() * 0.3),
        scanned: prev.scanned + Math.floor(Math.random() * 50),
        alerts: prev.alerts + (Math.random() > 0.8 ? 1 : 0)
      }));

      setChartData(prev => {
        const newData = [...prev];
        newData.shift();
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        newData.push({
          time: timeStr,
          threats: 30 + Math.floor(Math.random() * 50),
          scanned: 1000 + Math.floor(Math.random() * 600)
        });
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'threat':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/></svg>;
      case 'block':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>;
      case 'scan':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>;
      default:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#cc6666';
      case 'high': return '#cc9966';
      case 'medium': return '#99cc66';
      case 'low': return '#66b3cc';
      default: return '#888888';
    }
  };

  return (
    <section id="demo" className={styles.demoSection}>
      <div className={styles.container}>
        
        {/* Compact Header */}
        <header className={styles.header}>
          <div className={styles.badge}>Live Demo</div>
          <h2 className={styles.title}>
            <span className={styles.titleAccent}>Zecure</span> Dashboard
          </h2>
        </header>

        <div className={styles.demoContainer}>
          <div className={styles.mockDashboard}>
            
            {/* Compact Dashboard Header */}
            <div className={styles.dashboardHeader}>
              <h3 className={styles.headerTitle}>Command Center</h3>
              <div className={styles.statusIndicator}>
                <div className={`${styles.pulse} ${isActive ? styles.active : ''}`} />
                <span>Live</span>
              </div>
            </div>
            
            {/* Compact Metrics Grid */}
            <div className={styles.dashboardGrid}>
              <div className={styles.metric}>
                <div className={styles.metricIcon} style={{ color: '#cc6666' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/>
                  </svg>
                </div>
                <div className={styles.metricValue}>{metrics.threats.toLocaleString()}</div>
                <div className={styles.metricLabel}>Threats</div>
              </div>
              
              <div className={styles.metric}>
                <div className={styles.metricIcon} style={{ color: '#66a388' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
                <div className={styles.metricValue}>{metrics.blocked.toFixed(1)}%</div>
                <div className={styles.metricLabel}>Success</div>
              </div>
              
              <div className={styles.metric}>
                <div className={styles.metricIcon} style={{ color: '#66b3cc' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <div className={styles.metricValue}>{(metrics.scanned / 1000).toFixed(1)}K</div>
                <div className={styles.metricLabel}>Scanned</div>
              </div>
              
              <div className={styles.metric}>
                <div className={styles.metricIcon} style={{ color: '#cc9966' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                  </svg>
                </div>
                <div className={styles.metricValue}>{metrics.alerts}</div>
                <div className={styles.metricLabel}>Alerts</div>
              </div>
            </div>

            {/* Compact Charts and Activity */}
            <div className={styles.dashboardContent}>
              
              {/* Compact Chart */}
              <div className={styles.chartSection}>
                <h4 className={styles.sectionTitle}>Activity</h4>
                <svg className={styles.chart} viewBox="0 0 300 120">
                  <defs>
                    <pattern id="grid" width="30" height="12" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 12" fill="none" stroke="#333" strokeWidth="0.5" opacity="0.2"/>
                    </pattern>
                  </defs>
                  <rect width="300" height="120" fill="url(#grid)" />
                  
                  <polyline
                    fill="none"
                    stroke="#cc6666"
                    strokeWidth="2"
                    points={chartData.map((d, i) => `${i * 60 + 30},${120 - (d.threats * 1.2)}`).join(' ')}
                    className={styles.chartLine}
                  />
                  
                  <polyline
                    fill="none"
                    stroke="#66b3cc"
                    strokeWidth="2"
                    points={chartData.map((d, i) => `${i * 60 + 30},${120 - (d.scanned / 20)}`).join(' ')}
                    className={styles.chartLine}
                  />
                  
                  {chartData.map((d, i) => (
                    <g key={i}>
                      <circle cx={i * 60 + 30} cy={120 - (d.threats * 1.2)} r="2.5" fill="#cc6666" />
                      <circle cx={i * 60 + 30} cy={120 - (d.scanned / 20)} r="2.5" fill="#66b3cc" />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Compact Activity Feed */}
              <div className={styles.activitySection}>
                <h4 className={styles.sectionTitle}>Recent</h4>
                <div className={styles.activityFeed}>
                  {activities.map((activity) => (
                    <div key={activity.id} className={styles.activityItem}>
                      <div 
                        className={styles.activityIcon}
                        style={{ color: getSeverityColor(activity.severity) }}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className={styles.activityContent}>
                        <div className={styles.activityMessage}>{activity.message}</div>
                        <div className={styles.activityTime}>{activity.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
