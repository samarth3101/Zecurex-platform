'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.scss';

interface ModuleData {
    id: string;
    name: string;
    shortName: string;
    status: 'active' | 'warning' | 'critical' | 'offline';
    value: string;
    change: string;
    color: string;
    icon: React.ReactNode;
    isPremium?: boolean;
}

interface AlertData {
    id: string;
    type: 'threat' | 'fraud' | 'compliance' | 'system';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
}

interface MasterActivity {
    module: string;
    action: string;
    timestamp: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [userType] = useState<'demo' | 'paid'>('demo');
    const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

    // Master Mode States with Persistence
    const [showDeveloperPanel, setShowDeveloperPanel] = useState(false);
    const [showSummaryPanel, setShowSummaryPanel] = useState(false);
    const [developerPassword, setDeveloperPassword] = useState('');
    const [isMasterMode, setIsMasterMode] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [masterStartTime, setMasterStartTime] = useState<Date | null>(null);
    const [masterActivities, setMasterActivities] = useState<MasterActivity[]>([]);

    // Developer password
    const DEVELOPER_PASSWORD = 'dev2024';

    // Load MASTER mode state from localStorage on component mount
    useEffect(() => {
        const savedMasterMode = localStorage.getItem('zecure-master-mode');
        const savedStartTime = localStorage.getItem('zecure-master-start');
        const savedActivities = localStorage.getItem('zecure-master-activities');

        if (savedMasterMode === 'true') {
            setIsMasterMode(true);
            if (savedStartTime) {
                setMasterStartTime(new Date(savedStartTime));
            }
            if (savedActivities) {
                setMasterActivities(JSON.parse(savedActivities));
            }
        }
    }, []);

    // Save MASTER mode state to localStorage whenever it changes
    useEffect(() => {
        if (isMasterMode) {
            localStorage.setItem('zecure-master-mode', 'true');
            if (masterStartTime) {
                localStorage.setItem('zecure-master-start', masterStartTime.toISOString());
            }
            localStorage.setItem('zecure-master-activities', JSON.stringify(masterActivities));
        } else {
            localStorage.removeItem('zecure-master-mode');
            localStorage.removeItem('zecure-master-start');
            localStorage.removeItem('zecure-master-activities');
        }
    }, [isMasterMode, masterStartTime, masterActivities]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Cycle through alerts for ticker
    useEffect(() => {
        const ticker = setInterval(() => {
            setCurrentAlertIndex(prev => (prev + 1) % alertsData.length);
        }, 4000);
        return () => clearInterval(ticker);
    }, []);

    // Developer Panel Functions
    const handleDeveloperAccess = () => {
        if (developerPassword === DEVELOPER_PASSWORD) {
            setIsMasterMode(true);
            setMasterStartTime(new Date());
            setShowDeveloperPanel(false);
            setDeveloperPassword('');
            setPasswordError('');

            // Add initial activity
            const initialActivity = {
                module: 'System',
                action: 'Master mode activated',
                timestamp: new Date().toLocaleTimeString()
            };
            setMasterActivities([initialActivity]);
        } else {
            setPasswordError('Access Denied');
            setDeveloperPassword('');
        }
    };

    const handleMasterSummary = () => {
        // Add some sample activities (in real app, track actual usage)
        const activities = [
            ...masterActivities,
            {
                module: 'Compliance & Audit',
                action: 'Accessed restricted reports',
                timestamp: new Date(Date.now() - 300000).toLocaleTimeString()
            },
            {
                module: 'Security Playground',
                action: 'Ran security simulations',
                timestamp: new Date(Date.now() - 180000).toLocaleTimeString()
            },
            {
                module: 'AI Agent (ZPT)',
                action: 'Full system analysis completed',
                timestamp: new Date(Date.now() - 60000).toLocaleTimeString()
            }
        ];

        setMasterActivities(activities);
        setShowSummaryPanel(true);
    };

    const handleFinishMasterMode = () => {
        setIsMasterMode(false);
        setShowSummaryPanel(false);
        setMasterStartTime(null);
        setMasterActivities([]);
    };

    const handleBadgeClick = () => {
        if (isMasterMode) {
            handleMasterSummary();
        } else {
            setShowDeveloperPanel(true);
            setPasswordError('');
        }
    };

    const calculateSessionDuration = () => {
        if (!masterStartTime) return '0m';
        const duration = Math.floor((Date.now() - masterStartTime.getTime()) / 60000);
        return `${duration}m`;
    };

    const modules: ModuleData[] = [
        {
            id: 'threat-detection',
            name: 'Threat Detection Engine',
            shortName: 'Threat Engine',
            status: 'active',
            value: '1,247',
            change: '+18',
            color: '#cc6666',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
            )
        },
        {
            id: 'transaction-monitoring',
            name: 'Transaction Monitoring',
            shortName: 'Transactions',
            status: 'active',
            value: '$2.4M',
            change: '+156',
            color: '#66a388',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            )
        },
        {
            id: 'fraud-analysis',
            name: 'Fraud Analysis Hub',
            shortName: 'Fraud Hub',
            status: 'warning',
            value: '43',
            change: '+7',
            color: '#cc9966',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            )
        },
        {
            id: 'user-behavior',
            name: 'User Behavior Analytics',
            shortName: 'Behavior',
            status: 'active',
            value: '98.7%',
            change: '+2.3%',
            color: '#9999cc',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                </svg>
            )
        },
        {
            id: 'real-time-alerts',
            name: 'Real-Time Alerts',
            shortName: 'Alerts',
            status: 'critical',
            value: '23',
            change: '+5',
            color: '#cc6666',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            )
        },
        {
            id: 'compliance-audit',
            name: 'Compliance & Audit Reports',
            shortName: 'Compliance',
            status: 'active',
            value: '99.1%',
            change: '12',
            color: '#66b3cc',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                </svg>
            ),
            isPremium: true
        },
        {
            id: 'security-playground',
            name: 'Security Playground',
            shortName: 'Playground',
            status: 'active',
            value: '8',
            change: '3',
            color: '#99cc66',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                </svg>
            ),
            isPremium: true
        },
        {
            id: 'ai-agent',
            name: 'Zecure AI Agent (ZPT)',
            shortName: 'AI Agent',
            status: 'active',
            value: 'Active',
            change: '24/7',
            color: '#00d4ff',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="16" height="12" x="4" y="8" rx="2" />
                    <path d="M2 14h2" />
                    <path d="M20 14h2" />
                    <circle cx="12" cy="11" r="2" fill="currentColor" />
                </svg>
            ),
            isPremium: true
        }
    ];

    const alertsData: AlertData[] = [
        { id: '1', type: 'threat', message: 'Advanced malware detected in email attachment - Investigation initiated', severity: 'critical', timestamp: '2m ago' },
        { id: '2', type: 'fraud', message: 'Suspicious transaction pattern identified - $15,000 flagged for review', severity: 'high', timestamp: '5m ago' },
        { id: '3', type: 'system', message: 'AI Agent ZPT completed comprehensive threat analysis - 247 threats processed', severity: 'low', timestamp: '8m ago' },
        { id: '4', type: 'compliance', message: 'Weekly audit report generated - 99.1% compliance maintained', severity: 'medium', timestamp: '12m ago' },
        { id: '5', type: 'threat', message: 'Phishing attempt blocked - 15 employees protected from credential theft', severity: 'high', timestamp: '15m ago' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#66a388';
            case 'warning': return '#cc9966';
            case 'critical': return '#cc6666';
            case 'offline': return '#666666';
            default: return '#888888';
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
        <div className={styles.dashboard}>
            {/* Clean Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logoSection}>
                        <div className={styles.logo}>
                            <span className={styles.logoAccent}>Zecure</span>
                            <span className={styles.logoText}>Security Platform</span>
                        </div>
                        <div className={styles.userBadge}>
                            <span
                                className={`${styles.badge} ${isMasterMode ? styles.master : styles[userType]} ${styles.clickable}`}
                                onClick={handleBadgeClick}
                                title={isMasterMode ? 'Click to end Master session' : 'Click for Developer Access'}
                            >
                                {isMasterMode ? 'MASTER' : (userType === 'paid' ? 'Premium' : 'Demo')}
                                {isMasterMode ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.badgeIcon}>
                                        <path d="M9 12l2 2 4-4" />
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.badgeIcon}>
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className={styles.headerStats}>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>99.8%</div>
                            <div className={styles.statLabel}>System Health</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>23</div>
                            <div className={styles.statLabel}>Active Alerts</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}> 30s</div>
                            <div className={styles.statLabel}>Response Time</div>
                        </div>
                    </div>

                    <div className={styles.headerRight}>
                        <div className={styles.timeDisplay} suppressHydrationWarning={true}>
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            </header>

            {/* News Ticker Style Alert Bar */}
            {/* News Ticker Style Alert Bar */}
            <div className={styles.alertTicker}>
                <div className={styles.tickerLabel}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    </svg>
                    LIVE ALERTS
                </div>
                <div className={styles.tickerContent}>
                    <div
                        key={currentAlertIndex} // This is crucial - forces re-render and animation
                        className={styles.tickerMessage}
                        style={{ '--severity-color': getSeverityColor(alertsData[currentAlertIndex].severity) } as React.CSSProperties}
                    >
                        <span className={styles.tickerSeverity}>
                            {alertsData[currentAlertIndex].severity.toUpperCase()}
                        </span>
                        <span className={styles.tickerText}>
                            {alertsData[currentAlertIndex].message}
                        </span>
                        <span className={styles.tickerTime}>
                            {alertsData[currentAlertIndex].timestamp}
                        </span>
                    </div>
                </div>
            </div>


            {/* Main Dashboard */}
            <main className={styles.main}>
                <div className={styles.dashboardLayout}>

                    {/* Left Section - Security Modules Grid */}
                    <div className={styles.modulesSection}>
                        <div className={styles.sectionHeader}>
                            <h2>Security Modules</h2>
                            <div className={styles.moduleCount}>{modules.length} Active</div>
                        </div>

                        <div className={styles.modulesGrid}>
                            {modules.map((module) => (
                                <div
                                    key={module.id}
                                    className={`${styles.moduleCard} ${activeModule === module.id ? styles.active : ''
                                        } ${module.isPremium && userType === 'demo' && !isMasterMode ? styles.locked : ''}`}
                                    style={{ '--module-color': module.color } as React.CSSProperties}
                                    onMouseEnter={() => setActiveModule(module.id)}
                                    onMouseLeave={() => setActiveModule(null)}
                                    onClick={() => {
                                        if (module.isPremium && userType === 'demo' && !isMasterMode) return;
                                        router.push(`/dashboard/${module.id}`);
                                    }}
                                >
                                    <div className={styles.moduleHeader}>
                                        <div className={styles.moduleIcon} style={{ color: module.color }}>
                                            {module.icon}
                                        </div>

                                        {/* Status dot always present */}
                                        <div
                                            className={styles.moduleStatus}
                                            style={{ backgroundColor: getStatusColor(module.status) }}
                                        ></div>
                                    </div>

                                    {/* Premium badge when needed */}
                                    {module.isPremium && userType === 'demo' && !isMasterMode && (
                                        <div className={styles.premiumBadge}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                            Premium
                                        </div>
                                    )}

                                    <div className={styles.moduleContent}>
                                        <h3 className={styles.moduleName}>{module.shortName}</h3>
                                        <div className={styles.moduleValue}>{module.value}</div>
                                        <div className={styles.moduleChange} style={{ color: module.color }}>
                                            +{module.change}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Section - ZPT AI Agent */}
                    <div className={styles.aiSection}>
                        <div className={styles.aiAgentCard}>
                            <div className={styles.agentHeader}>
                                <div className={styles.agentAvatar}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect width="16" height="12" x="4" y="8" rx="2" />
                                        <path d="M2 14h2" />
                                        <path d="M20 14h2" />
                                        <circle cx="12" cy="11" r="2" fill="currentColor" />
                                    </svg>
                                </div>
                                <div className={styles.agentInfo}>
                                    <h3>ZPT AI Agent</h3>
                                    <p>Autonomous Security Assistant</p>
                                    <div className={styles.agentStatus}>
                                        <div className={styles.statusIndicator}></div>
                                        <span>Active & Monitoring</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.agentMetrics}>
                                <div className={styles.metric}>
                                    <div className={styles.metricNumber}>247</div>
                                    <div className={styles.metricLabel}>Threats Analyzed</div>
                                </div>
                                <div className={styles.metric}>
                                    <div className={styles.metricNumber}>18</div>
                                    <div className={styles.metricLabel}>Recommendations</div>
                                </div>
                                <div className={styles.metric}>
                                    <div className={styles.metricNumber}> 5s</div>
                                    <div className={styles.metricLabel}>Response Time</div>
                                </div>
                            </div>

                            <div className={styles.agentActions}>
                                <button className={styles.primaryAction}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    Chat with ZPT
                                </button>
                                <button className={styles.secondaryAction}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    </svg>
                                    View Reports
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.quickActions}>
                    <button className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        System Scan
                    </button>
                    <button className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Security Check
                    </button>
                    <button className={styles.actionBtn}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        </svg>
                        Generate Report
                    </button>
                </div>

            </main>

            {/* Developer Access Panel */}
            {showDeveloperPanel && (
                <div className={styles.devOverlay} onClick={() => setShowDeveloperPanel(false)}>
                    <div className={styles.devPanel} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.devHeader}>
                            <div className={styles.devLock}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <div className={styles.devInfo}>
                                <span className={styles.devTitle}>Developer Access</span>
                                <span className={styles.devSubtitle}>Zecure Master Console</span>
                            </div>
                            <button
                                className={styles.devClose}
                                onClick={() => setShowDeveloperPanel(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.devContent}>
                            <div className={styles.devDescription}>
                                Enter developer credentials to access premium modules and full system control.
                            </div>

                            <input
                                type="password"
                                value={developerPassword}
                                onChange={(e) => setDeveloperPassword(e.target.value)}
                                className={styles.devInput}
                                placeholder="Developer Password"
                                onKeyPress={(e) => e.key === 'Enter' && handleDeveloperAccess()}
                                autoFocus
                            />

                            {passwordError && (
                                <div className={styles.devError}>{passwordError}</div>
                            )}
                        </div>

                        <div className={styles.devActions}>
                            <button
                                className={styles.devCancel}
                                onClick={() => setShowDeveloperPanel(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.devUnlock}
                                onClick={handleDeveloperAccess}
                                disabled={!developerPassword}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                Unlock Master Mode
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Master Session Summary Panel with Description Box */}
            {showSummaryPanel && (
                <div className={styles.summaryOverlay} onClick={() => setShowSummaryPanel(false)}>
                    <div className={styles.summaryPanel} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.summaryHeader}>
                            <div className={styles.summaryIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 12l2 2 4-4" />
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <div className={styles.summaryInfo}>
                                <h3>Master Session Summary</h3>
                                <p>Review your development session activity</p>
                            </div>
                        </div>

                        <div className={styles.summaryContent}>
                            {/* Description Box */}
                            <div className={styles.descriptionBox}>
                                <div className={styles.descriptionHeader}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                                        <polyline points="13,2 13,9 20,9" />
                                    </svg>
                                    <h4>Session Overview</h4>
                                </div>
                                <p className={styles.descriptionText}>
                                    You've been operating in Master Mode with elevated privileges. This session has granted you access to all premium security modules, compliance tools, and advanced system controls. All activities have been logged for security compliance.
                                </p>
                            </div>

                            <div className={styles.sessionStats}>
                                <div className={styles.sessionStat}>
                                    <div className={styles.statIcon}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12,6 12,12 16,14" />
                                        </svg>
                                    </div>
                                    <div className={styles.statData}>
                                        <span className={styles.statValue}>{calculateSessionDuration()}</span>
                                        <span className={styles.statLabel}>Session Duration</span>
                                    </div>
                                </div>

                                <div className={styles.sessionStat}>
                                    <div className={styles.statIcon}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                    </div>
                                    <div className={styles.statData}>
                                        <span className={styles.statValue}>{masterActivities.length}</span>
                                        <span className={styles.statLabel}>Actions Performed</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.activityLog}>
                                <h4>Session Activity</h4>
                                <div className={styles.activityList}>
                                    {masterActivities.map((activity, index) => (
                                        <div key={index} className={styles.activityItem}>
                                            <div className={styles.activityIcon}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="9,11 12,14 22,4" />
                                                    <path d="M21,12v7a2,2 0 0,1 -2,2H5a2,2 0 0,1 -2,-2V5a2,2 0 0,1 2,-2h11" />
                                                </svg>
                                            </div>
                                            <div className={styles.activityDetails}>
                                                <span className={styles.activityModule}>{activity.module}</span>
                                                <span className={styles.activityAction}>{activity.action}</span>
                                                <span className={styles.activityTime}>{activity.timestamp}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.summaryActions}>
                            <button
                                className={styles.summaryCancel}
                                onClick={() => setShowSummaryPanel(false)}
                            >
                                Continue Session
                            </button>
                            <button
                                className={styles.summaryFinish}
                                onClick={handleFinishMasterMode}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 11H1l4-4" />
                                    <path d="M5 7v6c0 2.8 2.2 5 5 5h11" />
                                </svg>
                                Finish & Return to Demo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
