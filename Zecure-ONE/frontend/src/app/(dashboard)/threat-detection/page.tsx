'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './threat-detection.module.scss';

interface ThreatData {
  id: string;
  type: 'malware' | 'phishing' | 'ddos' | 'intrusion' | 'ransomware' | 'bruteforce';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'contained' | 'resolved';
  action: 'blocked' | 'quarantined' | 'monitored';
  source: string;
  sourceLocation?: string;
  target: string;
  detected: string;
  description: string;
  tags: string[];
  confidence: number;
}

// Client-side time component to prevent hydration mismatch
function ClientTime() {
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    // Render placeholder during SSR to prevent hydration mismatch
    return <span suppressHydrationWarning>--:--</span>;
  }

  return <span>{time}</span>;
}

export default function ThreatDetection() {
  const router = useRouter();
  const [threats, setThreats] = useState<ThreatData[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'contained' | 'resolved'>('all');
  const [realTimeDetection, setRealTimeDetection] = useState(true);
  const [sensitivity, setSensitivity] = useState(75);
  const [isScanning, setIsScanning] = useState(false);
  // Removed lastUpdate state that was causing hydration error

  useEffect(() => {
    setThreats([
      {
        id: 'THR-001',
        type: 'malware',
        severity: 'critical',
        status: 'active',
        action: 'blocked',
        source: '192.168.1.45',
        sourceLocation: 'Moscow, RU',
        target: 'email-server',
        detected: '2m ago',
        description: 'Advanced persistent threat detected in email attachment',
        tags: ['APT', 'Email', 'Polymorphic'],
        confidence: 96
      },
      {
        id: 'THR-002',
        type: 'phishing',
        severity: 'high',
        status: 'contained',
        action: 'quarantined',
        source: 'phishing-site.com',
        sourceLocation: 'Beijing, CN',
        target: 'user-accounts',
        detected: '15m ago',
        description: 'Credential harvesting campaign targeting finance department',
        tags: ['Phishing', 'Credentials', 'Finance'],
        confidence: 89
      },
      {
        id: 'THR-003',
        type: 'intrusion',
        severity: 'medium',
        status: 'resolved',
        action: 'monitored',
        source: '10.0.0.23',
        sourceLocation: 'Unknown',
        target: 'database',
        detected: '1h ago',
        description: 'Suspicious login patterns from unrecognized device',
        tags: ['Login', 'Database', 'Anomaly'],
        confidence: 72
      }
    ]);

    // Removed the interval that was updating lastUpdate state
  }, []);

  const filteredThreats = filter === 'all' ? threats : threats.filter(t => t.status === filter);
  
  const threatCounts = {
    total: threats.length,
    critical: threats.filter(t => t.severity === 'critical').length,
    active: threats.filter(t => t.status === 'active').length,
    blocked: threats.filter(t => t.action === 'blocked').length
  };

  const handleScan = (type: 'full' | 'quick') => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), type === 'full' ? 8000 : 3000);
  };

  return (
    <div className={styles.threatPage}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          className={styles.backButton} 
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push('/');
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>
        
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <div>
              <h1>Threat Detection Engine</h1>
              <p>AI-powered real-time threat monitoring & response</p>
            </div>
          </div>
          
          <div className={styles.statusIndicator}>
            <div className={`${styles.pulse} ${realTimeDetection ? styles.active : ''}`}></div>
            <span>Real-time Active</span>
          </div>
        </div>

        <div className={styles.headerStats}>
          <div className={styles.lastUpdate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span>Updated <ClientTime /></span>
          </div>
        </div>
      </header>

      {/* Stats Row - 4 Blocks in One Line */}
      <section className={styles.statsRow}>
        <div className={`${styles.statBlock} ${styles.primary}`}>
          <div className={styles.statIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{threatCounts.total}</div>
            <div className={styles.statLabel}>Total Threats</div>
            <div className={styles.statTrend}>+{threatCounts.active} Active</div>
          </div>
        </div>

        <div className={`${styles.statBlock} ${styles.critical}`}>
          <div className={styles.statIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{threatCounts.critical}</div>
            <div className={styles.statLabel}>Critical Threats</div>
            <div className={styles.statTrend}>Immediate attention</div>
          </div>
        </div>

        <div className={`${styles.statBlock} ${styles.success}`}>
          <div className={styles.statIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>99.2%</div>
            <div className={styles.statLabel}>Detection Rate</div>
            <div className={styles.statTrend}>+2.1% this week</div>
          </div>
        </div>

        <div className={`${styles.statBlock} ${styles.blocked}`}>
          <div className={styles.statIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{threatCounts.blocked}</div>
            <div className={styles.statLabel}>Blocked Today</div>
            <div className={styles.statTrend}>Auto-mitigation</div>
          </div>
        </div>
      </section>

      {/* Matrix Grid - 2x2 Quadrants */}
      <section className={styles.matrixGrid}>
        {/* Quadrant 1: AI Security Intelligence */}
        <div className={styles.quadrant}>
          <div className={styles.quadrantHeader}>
            <div className={styles.quadrantTitle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
                <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
              </svg>
              <h2>AI Security Intelligence</h2>
            </div>
            <div className={styles.aiStatus}>
              <div className={styles.aiIndicator}></div>
              <span>ZPT Active</span>
            </div>
          </div>
          
          <div className={styles.quadrantContent}>
            <div className={styles.insightCard}>
              <div className={styles.insightHeader}>
                <span className={styles.insightSeverity}>High Priority</span>
                <span className={styles.confidence}>96% Confidence</span>
              </div>
              <h3>Coordinated Attack Pattern Detected</h3>
              <p>AI has identified a sophisticated multi-vector attack targeting your infrastructure. The pattern suggests an APT group with previous attribution to state-sponsored activities.</p>
              <div className={styles.insightActions}>
                <button className={styles.primaryBtn}>Investigate</button>
                <button className={styles.secondaryBtn}>View Details</button>
              </div>
            </div>
          </div>
        </div>

        {/* Quadrant 2: Filter Threats */}
        <div className={styles.quadrant}>
          <div className={styles.quadrantHeader}>
            <div className={styles.quadrantTitle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
              </svg>
              <h2>Filter Threats</h2>
            </div>
          </div>
          
          <div className={styles.quadrantContent}>
            <div className={styles.filters}>
              {(['all', 'active', 'contained', 'resolved'] as const).map(status => (
                <button
                  key={status}
                  className={`${styles.filterBtn} ${filter === status ? styles.active : ''}`}
                  onClick={() => setFilter(status)}
                >
                  <span className={styles.filterIcon}>
                    {status === 'all' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                      </svg>
                    )}
                    {status === 'active' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/>
                      </svg>
                    )}
                    {status === 'contained' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    )}
                    {status === 'resolved' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                      </svg>
                    )}
                  </span>
                  <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  <span className={styles.filterCount}>
                    {status === 'all' ? threats.length : threats.filter(t => t.status === status).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quadrant 3: Live Threat Feed */}
        <div className={styles.quadrant}>
          <div className={styles.quadrantHeader}>
            <div className={styles.quadrantTitle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
              <h2>Live Threat Feed</h2>
            </div>
            <div className={styles.liveIndicator}>
              <div className={styles.livePulse}></div>
              <span>Live</span>
            </div>
          </div>

          <div className={styles.quadrantContent}>
            <div className={styles.threatList}>
              {filteredThreats.slice(0, 3).map(threat => (
                <div key={threat.id} className={`${styles.threatCard} ${styles[threat.severity]}`}>
                  <div className={styles.threatHeader}>
                    <div className={styles.threatMeta}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.threatTypeIcon}>
                        {threat.type === 'malware' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
                        {threat.type === 'phishing' && <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/>}
                        {threat.type === 'intrusion' && <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>}
                      </svg>
                      <div className={styles.threatInfo}>
                        <h4>{threat.description}</h4>
                        <div className={styles.threatDetails}>
                          <span className={styles.threatId}>{threat.id}</span>
                          <span className={styles.detected}>{threat.detected}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.severityBadge}>
                      <span className={`${styles.severityDot} ${styles[threat.severity]}`}></span>
                    </div>
                  </div>

                  <div className={styles.threatActions}>
                    <button className={styles.detailsBtn}>Details</button>
                    <button className={styles.investigateBtn}>Investigate</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quadrant 4: Detection Controls */}
        <div className={styles.quadrant}>
          <div className={styles.quadrantHeader}>
            <div className={styles.quadrantTitle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6M8.2 8.2l4.2 4.2m0-8.4L8.2 15.8M1 12h6m6 0h6"/>
              </svg>
              <h2>Detection Controls</h2>
            </div>
            <div className={styles.systemStatus}>
              <div className={`${styles.statusDot} ${realTimeDetection ? styles.online : styles.offline}`}></div>
              <span>System {realTimeDetection ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          <div className={styles.quadrantContent}>
            <div className={styles.controlsGrid}>
              <div className={styles.scanControls}>
                <h4>Manual Scanning</h4>
                <div className={styles.scanButtons}>
                  <button 
                    className={`${styles.scanBtn} ${styles.fullScan} ${isScanning ? styles.scanning : ''}`}
                    onClick={() => handleScan('full')}
                    disabled={isScanning}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
                    </svg>
                    <span>Full Scan</span>
                    {isScanning && <div className={styles.scanProgress}></div>}
                  </button>
                  <button 
                    className={`${styles.scanBtn} ${styles.quickScan}`}
                    onClick={() => handleScan('quick')}
                    disabled={isScanning}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23,4 23,10 17,10"/>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10"/>
                    </svg>
                    <span>Quick Scan</span>
                  </button>
                </div>
              </div>

              <div className={styles.settingsControls}>
                <h4>Settings</h4>
                <div className={styles.settingGroup}>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={realTimeDetection}
                      onChange={(e) => setRealTimeDetection(e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                    <span className={styles.switchLabel}>Real-Time Detection</span>
                  </label>
                </div>

                <div className={styles.settingGroup}>
                  <div className={styles.sensitivityControl}>
                    <label>Sensitivity</label>
                    <div className={styles.sensitivityValue}>{sensitivity}%</div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={sensitivity}
                    onChange={(e) => setSensitivity(parseInt(e.target.value))}
                    className={styles.sensitivitySlider}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
