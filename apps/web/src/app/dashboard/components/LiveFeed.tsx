/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { ZecureAPI } from '@/lib/api';
import styles from './LiveFeed.module.scss';

export default function LiveFeed({ onSelect, selectedId }: { onSelect: (id: string) => void, selectedId: string | null }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    try {
      const data = await ZecureAPI.getTransactions(20);
      setTransactions(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && transactions.length === 0) {
    return <div className={styles.loading}>Loading live feed...</div>;
  }

  if (error && transactions.length === 0) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.feedList}>
      {transactions.map(tx => {
        let riskClass = '';
        if (tx.risk_level === 'CRITICAL') riskClass = styles.critical;
        else if (tx.risk_level === 'HIGH') riskClass = styles.high;
        else if (tx.risk_level === 'MEDIUM') riskClass = styles.medium;
        else riskClass = styles.low;

        const scoreDisplay = tx.risk_score !== null && tx.risk_score !== undefined 
          ? (tx.risk_score * 100).toFixed(0) 
          : '--';

        return (
          <div 
            key={tx.id} 
            className={`${styles.feedItem} ${riskClass} ${selectedId === tx.id ? styles.selected : ''}`}
            onClick={() => onSelect(tx.id)}
          >
            <div className={styles.itemHeader}>
              <span className={styles.amount}>₹{tx.amount.toLocaleString()}</span>
              <div className={styles.riskBadge}>
                {tx.risk_level ? `${tx.risk_level} (${scoreDisplay})` : 'PENDING'}
              </div>
            </div>
            <div className={styles.itemDetails}>
              <span className={styles.time}>{new Date(tx.created_at).toLocaleTimeString()}</span>
              <span className={styles.method}>{tx.method?.toUpperCase()}</span>
              <span className={styles.customerId}>{tx.customer_id ? `${tx.customer_id.substring(0, 8)}...` : 'Unknown'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
