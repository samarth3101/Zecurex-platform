'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './user-behavior.module.scss';

interface UserActivity {
    id: string;
    userId: string;
    action: string;
    timestamp: string;
    riskScore: number;
    location: string;
    device: string;
    anomaly: boolean;
}

export default function UserBehavior() {
    const router = useRouter();
    const [activities, setActivities] = useState<UserActivity[]>([]);
    const [behaviorScore, setBehaviorScore] = useState(98.7);

    useEffect(() => {
        setActivities([
            {
                id: '1',
                userId: 'user_12345',
                action: 'Login attempt',
                timestamp: '2m ago',
                riskScore: 15,
                location: 'New York, US',
                device: 'Chrome/Windows',
                anomaly: false
            },
            {
                id: '2',
                userId: 'user_67890',
                action: 'Password change',
                timestamp: '15m ago',
                riskScore: 75,
                location: 'Unknown',
                device: 'Mobile/Android',
                anomaly: true
            },
            {
                id: '3',
                userId: 'user_54321',
                action: 'File download',
                timestamp: '30m ago',
                riskScore: 35,
                location: 'California, US',
                device: 'Firefox/macOS',
                anomaly: false
            }
        ]);
    }, []);

    return (
        <div className={styles.behaviorPage}>
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
                    <h1>User Behavior Analytics</h1>
                    <p>AI-powered behavioral analysis and anomaly detection</p>
                </div>
            </header>

            <div className={styles.behaviorMetrics}>
                <div className={styles.scoreCard}>
                    <div className={styles.scoreValue}>{behaviorScore}%</div>
                    <div className={styles.scoreLabel}>Behavior Confidence</div>
                    <div className={styles.scoreIndicator}>
                        <div
                            className={styles.scoreBar}
                            style={{ width: `${behaviorScore}%` }}
                        ></div>
                    </div>
                </div>
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>1,847</span>
                        <span className={styles.statLabel}>Users Monitored</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>23</span>
                        <span className={styles.statLabel}>Anomalies Detected</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>5</span>
                        <span className={styles.statLabel}>High Risk Users</span>
                    </div>
                </div>
            </div>

            <div className={styles.analysisSection}>
                <div className={styles.activitiesList}>
                    <h3>Recent User Activities</h3>
                    {activities.map(activity => (
                        <div
                            key={activity.id}
                            className={`${styles.activityCard} ${activity.anomaly ? styles.anomaly : ''}`}
                        >
                            <div className={styles.activityHeader}>
                                <span className={styles.userId}>{activity.userId}</span>
                                <span className={styles.timestamp}>{activity.timestamp}</span>
                            </div>
                            <div className={styles.activityDetails}>
                                <div className={styles.action}>{activity.action}</div>
                                <div className={styles.metadata}>
                                    <span>📍 {activity.location}</span>
                                    <span>💻 {activity.device}</span>
                                </div>
                            </div>
                            <div className={styles.riskAssessment}>
                                <div className={styles.riskScore}>
                                    Risk: <span className={activity.riskScore > 50 ? styles.highRisk : styles.lowRisk}>
                                        {activity.riskScore}%
                                    </span>
                                </div>
                                {activity.anomaly && (
                                    <div className={styles.anomalyFlag}>
                                        ⚠️ Anomaly Detected
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.behaviorInsights}>
                    <h3>Behavior Insights</h3>
                    <div className={styles.insightCard}>
                        <h4>Unusual Login Patterns</h4>
                        <p>15% increase in off-hours login attempts detected in the last 24 hours.</p>
                        <div className={styles.insightAction}>Investigate</div>
                    </div>
                    <div className={styles.insightCard}>
                        <h4>Device Fingerprinting</h4>
                        <p>3 users showed device anomalies, potentially indicating account sharing.</p>
                        <div className={styles.insightAction}>Review</div>
                    </div>
                    <div className={styles.insightCard}>
                        <h4>Geographic Anomalies</h4>
                        <p>2 users accessed from unusual geographic locations within short timeframes.</p>
                        <div className={styles.insightAction}>Alert</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
