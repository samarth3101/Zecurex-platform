'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './threat-detection.module.scss';

interface ThreatData {
    id: string;
    type: 'malware' | 'phishing' | 'ddos' | 'intrusion';
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    target: string;
    timestamp: string;
    status: 'active' | 'contained' | 'resolved';
}

export default function ThreatDetection() {
    const router = useRouter();
    const [threats, setThreats] = useState<ThreatData[]>([]);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        // Mock threat data
        setThreats([
            { id: '1', type: 'malware', severity: 'critical', source: '192.168.1.45', target: 'email-server', timestamp: '2m ago', status: 'active' },
            { id: '2', type: 'phishing', severity: 'high', source: 'external', target: 'user-accounts', timestamp: '15m ago', status: 'contained' },
            { id: '3', type: 'intrusion', severity: 'medium', source: '10.0.0.23', target: 'database', timestamp: '1h ago', status: 'resolved' },
        ]);
    }, []);

    return (
        <div className={styles.threatPage}>
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
                    <h1>Threat Detection Engine</h1>
                    <p>Real-time threat monitoring and analysis</p>
                </div>
            </header>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>1,247</div>
                    <div className={styles.statLabel}>Total Threats</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>18</div>
                    <div className={styles.statLabel}>Active</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>99.2%</div>
                    <div className={styles.statLabel}>Detection Rate</div>
                </div>
            </div>

            <div className={styles.filters}>
                {['all', 'active', 'contained', 'resolved'].map(filter => (
                    <button
                        key={filter}
                        className={`${styles.filterBtn} ${activeFilter === filter ? styles.active : ''}`}
                        onClick={() => setActiveFilter(filter)}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>

            <div className={styles.threatsList}>
                {threats.map(threat => (
                    <div key={threat.id} className={`${styles.threatCard} ${styles[threat.severity]}`}>
                        <div className={styles.threatHeader}>
                            <span className={styles.threatType}>{threat.type}</span>
                            <span className={`${styles.threatStatus} ${styles[threat.status]}`}>
                                {threat.status}
                            </span>
                        </div>
                        <div className={styles.threatDetails}>
                            <p><strong>Source:</strong> {threat.source}</p>
                            <p><strong>Target:</strong> {threat.target}</p>
                            <p><strong>Detected:</strong> {threat.timestamp}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
