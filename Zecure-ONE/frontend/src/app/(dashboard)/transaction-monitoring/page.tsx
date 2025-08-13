'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './transaction-monitoring.module.scss';

interface Transaction {
    id: string;
    amount: number;
    type: 'credit' | 'debit' | 'transfer';
    status: 'pending' | 'completed' | 'flagged' | 'blocked';
    timestamp: string;
    account: string;
    riskScore: number;
}

export default function TransactionMonitoring() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalVolume, setTotalVolume] = useState('$2.4M');

    useEffect(() => {
        setTransactions([
            { id: 'TXN001', amount: 15000, type: 'transfer', status: 'flagged', timestamp: '2m ago', account: '****1234', riskScore: 85 },
            { id: 'TXN002', amount: 250, type: 'debit', status: 'completed', timestamp: '5m ago', account: '****5678', riskScore: 15 },
            { id: 'TXN003', amount: 50000, type: 'credit', status: 'pending', timestamp: '8m ago', account: '****9012', riskScore: 45 },
        ]);
    }, []);

    return (
        <div className={styles.transactionPage}>
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
                    <h1>Transaction Monitoring</h1>
                    <p>Real-time financial transaction analysis</p>
                </div>
            </header>

            <div className={styles.overview}>
                <div className={styles.volumeCard}>
                    <div className={styles.volumeValue}>{totalVolume}</div>
                    <div className={styles.volumeLabel}>24h Volume</div>
                    <div className={styles.volumeChange}>+156 transactions</div>
                </div>
                <div className={styles.metricsGrid}>
                    <div className={styles.metricItem}>
                        <span className={styles.metricValue}>2,847</span>
                        <span className={styles.metricLabel}>Total Transactions</span>
                    </div>
                    <div className={styles.metricItem}>
                        <span className={styles.metricValue}>12</span>
                        <span className={styles.metricLabel}>Flagged</span>
                    </div>
                    <div className={styles.metricItem}>
                        <span className={styles.metricValue}>3</span>
                        <span className={styles.metricLabel}>Blocked</span>
                    </div>
                </div>
            </div>

            <div className={styles.transactionsList}>
                <h3>Recent Transactions</h3>
                {transactions.map(transaction => (
                    <div key={transaction.id} className={`${styles.transactionCard} ${styles[transaction.status]}`}>
                        <div className={styles.transactionMain}>
                            <div className={styles.transactionId}>{transaction.id}</div>
                            <div className={styles.transactionAmount}>
                                ${transaction.amount.toLocaleString()}
                            </div>
                            <div className={styles.transactionType}>{transaction.type}</div>
                        </div>
                        <div className={styles.transactionDetails}>
                            <span>Account: {transaction.account}</span>
                            <span>Risk Score: {transaction.riskScore}%</span>
                            <span>{transaction.timestamp}</span>
                        </div>
                        <div className={`${styles.transactionStatus} ${styles[transaction.status]}`}>
                            {transaction.status}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
