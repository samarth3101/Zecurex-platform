'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './real-time-alerts.module.scss';

interface Alert {
    id: string;
    type: 'threat' | 'fraud' | 'compliance' | 'system';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    timestamp: string;
    status: 'new' | 'acknowledged' | 'resolved';
    source: string;
}

export default function RealTimeAlerts() {
    const router = useRouter();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [filter, setFilter] = useState('all');
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        const mockAlerts: Alert[] = [
            {
                id: 'ALT-001',
                type: 'threat',
                severity: 'critical',
                title: 'Advanced Malware Detected',
                message: 'Suspicious executable detected in email attachment from external source',
                timestamp: '2m ago',
                status: 'new',
                source: 'Email Security'
            },
            {
                id: 'ALT-002',
                type: 'fraud',
                severity: 'high',
                title: 'Suspicious Transaction Pattern',
                message: 'Multiple high-value transactions from same IP in short timeframe',
                timestamp: '5m ago',
                status: 'acknowledged',
                source: 'Transaction Monitor'
            },
            {
                id: 'ALT-003',
                type: 'system',
                severity: 'medium',
                title: 'System Performance Degradation',
                message: 'Database response time increased by 45% in the last 10 minutes',
                timestamp: '8m ago',
                status: 'new',
                source: 'System Monitor'
            },
            {
                id: 'ALT-004',
                type: 'compliance',
                severity: 'low',
                title: 'Policy Violation',
                message: 'User attempted to access restricted resource outside business hours',
                timestamp: '12m ago',
                status: 'resolved',
                source: 'Access Control'
            }
        ];
        setAlerts(mockAlerts);
    }, []);

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                // In real app, fetch new alerts here
                console.log('Refreshing alerts...');
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const handleAcknowledge = (alertId: string) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === alertId ? { ...alert, status: 'acknowledged' as const } : alert
        ));
    };

    const handleResolve = (alertId: string) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
        ));
    };

    const filteredAlerts = filter === 'all' ? alerts : alerts.filter(alert => alert.type === filter);

    return (
        <div className={styles.alertsPage}>
            <header className={styles.header}>
                <button
                    className={styles.backButton}
                    onClick={() => {
                        if (window.history.length > 1) {
                            router.back();
                        } else {
                            router.push('/?view=dashboard'); // fallback if no back history
                        }
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>

                <div className={styles.headerInfo}>
                    <h1>Real-Time Alerts</h1>
                    <p>Live security alerts and notifications</p>
                </div>
                <div className={styles.headerControls}>
                    <label className={styles.autoRefreshToggle}>
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        Auto Refresh
                    </label>
                </div>
            </header>

            <div className={styles.alertStats}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>23</div>
                    <div className={styles.statLabel}>Active Alerts</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>5</div>
                    <div className={styles.statLabel}>Critical</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>12</div>
                    <div className={styles.statLabel}>Acknowledged</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>147</div>
                    <div className={styles.statLabel}>Resolved Today</div>
                </div>
            </div>

            <div className={styles.alertFilters}>
                {['all', 'threat', 'fraud', 'compliance', 'system'].map(filterType => (
                    <button
                        key={filterType}
                        className={`${styles.filterBtn} ${filter === filterType ? styles.active : ''}`}
                        onClick={() => setFilter(filterType)}
                    >
                        {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    </button>
                ))}
            </div>

            <div className={styles.alertsList}>
                {filteredAlerts.map(alert => (
                    <div key={alert.id} className={`${styles.alertCard} ${styles[alert.severity]} ${styles[alert.status]}`}>
                        <div className={styles.alertHeader}>
                            <div className={styles.alertType}>
                                <span className={styles.typeIcon}>
                                    {alert.type === 'threat' && '🛡️'}
                                    {alert.type === 'fraud' && '⚠️'}
                                    {alert.type === 'compliance' && '📋'}
                                    {alert.type === 'system' && '⚙️'}
                                </span>
                                {alert.type.toUpperCase()}
                            </div>
                            <div className={styles.alertSeverity}>{alert.severity}</div>
                            <div className={styles.alertTime}>{alert.timestamp}</div>
                        </div>

                        <div className={styles.alertContent}>
                            <h3 className={styles.alertTitle}>{alert.title}</h3>
                            <p className={styles.alertMessage}>{alert.message}</p>
                            <div className={styles.alertSource}>Source: {alert.source}</div>
                        </div>

                        <div className={styles.alertActions}>
                            {alert.status === 'new' && (
                                <button
                                    className={styles.acknowledgeBtn}
                                    onClick={() => handleAcknowledge(alert.id)}
                                >
                                    Acknowledge
                                </button>
                            )}
                            {alert.status !== 'resolved' && (
                                <button
                                    className={styles.resolveBtn}
                                    onClick={() => handleResolve(alert.id)}
                                >
                                    Resolve
                                </button>
                            )}
                            <button className={styles.detailsBtn}>View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
