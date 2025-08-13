'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './fraud-analysis.module.scss';

interface FraudCase {
    id: string;
    type: 'identity_theft' | 'card_fraud' | 'account_takeover' | 'synthetic_identity';
    severity: 'low' | 'medium' | 'high' | 'critical';
    amount: number;
    status: 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
    timestamp: string;
    riskFactors: string[];
}

export default function FraudAnalysis() {
    const router = useRouter();
    const [fraudCases, setFraudCases] = useState<FraudCase[]>([]);
    const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);

    useEffect(() => {
        setFraudCases([
            {
                id: 'FRAUD-001',
                type: 'card_fraud',
                severity: 'high',
                amount: 2500,
                status: 'investigating',
                timestamp: '10m ago',
                riskFactors: ['Unusual location', 'High amount', 'Off-hours transaction']
            },
            {
                id: 'FRAUD-002',
                type: 'identity_theft',
                severity: 'critical',
                amount: 15000,
                status: 'confirmed',
                timestamp: '25m ago',
                riskFactors: ['Multiple failed logins', 'Device fingerprint mismatch', 'Velocity check failed']
            },
            {
                id: 'FRAUD-003',
                type: 'account_takeover',
                severity: 'medium',
                amount: 750,
                status: 'false_positive',
                timestamp: '1h ago',
                riskFactors: ['Password change', 'New device']
            }
        ]);
    }, []);

    return (
        <div className={styles.fraudPage}>
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
                    <h1>Fraud Analysis Hub</h1>
                    <p>Advanced fraud detection and investigation</p>
                </div>
            </header>

            <div className={styles.fraudMetrics}>
                <div className={styles.metricCard}>
                    <div className={styles.metricValue}>43</div>
                    <div className={styles.metricLabel}>Active Cases</div>
                    <div className={styles.metricTrend}>+7 today</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricValue}>$127K</div>
                    <div className={styles.metricLabel}>Prevented Loss</div>
                    <div className={styles.metricTrend}>This month</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricValue}>94.2%</div>
                    <div className={styles.metricLabel}>Detection Rate</div>
                    <div className={styles.metricTrend}>+2.1% improvement</div>
                </div>
            </div>

            <div className={styles.fraudContent}>
                <div className={styles.casesList}>
                    <h3>Recent Fraud Cases</h3>
                    {fraudCases.map(fraudCase => (
                        <div
                            key={fraudCase.id}
                            className={`${styles.caseCard} ${styles[fraudCase.severity]} ${selectedCase?.id === fraudCase.id ? styles.selected : ''}`}
                            onClick={() => setSelectedCase(fraudCase)}
                        >
                            <div className={styles.caseHeader}>
                                <span className={styles.caseId}>{fraudCase.id}</span>
                                <span className={`${styles.caseStatus} ${styles[fraudCase.status]}`}>
                                    {fraudCase.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className={styles.caseType}>
                                {fraudCase.type.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className={styles.caseAmount}>
                                ${fraudCase.amount.toLocaleString()}
                            </div>
                            <div className={styles.caseTime}>{fraudCase.timestamp}</div>
                        </div>
                    ))}
                </div>

                {selectedCase && (
                    <div className={styles.caseDetails}>
                        <h3>Case Details: {selectedCase.id}</h3>
                        <div className={styles.detailsContent}>
                            <div className={styles.detailItem}>
                                <label>Type:</label>
                                <span>{selectedCase.type.replace('_', ' ')}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Severity:</label>
                                <span className={styles[selectedCase.severity]}>{selectedCase.severity}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Amount:</label>
                                <span>${selectedCase.amount.toLocaleString()}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Status:</label>
                                <span>{selectedCase.status.replace('_', ' ')}</span>
                            </div>
                            <div className={styles.riskFactors}>
                                <label>Risk Factors:</label>
                                <div className={styles.factorsList}>
                                    {selectedCase.riskFactors.map((factor, index) => (
                                        <span key={index} className={styles.riskFactor}>
                                            {factor}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
