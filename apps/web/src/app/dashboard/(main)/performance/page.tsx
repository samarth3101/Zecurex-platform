'use client';

import React, { useEffect, useState } from 'react';
import { ZecureAPI } from '@/lib/api';
import styles from './performance.module.scss';

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    ZecureAPI.getPerformance()
      .then(data => {
        if (mounted) {
          setMetrics(data.test_metrics);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err.message || 'Failed to load metrics');
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading model metrics...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Model Performance</h2>
        <span className={styles.badge}>Synthetic Evaluation Results</span>
      </header>
      
      <div className={styles.content}>
        <p className={styles.description}>
          These metrics represent the actual locked synthetic held-out evaluation metrics from the Zecure ML artifact. 
          They are calculated on a synthetic test set simulating real-world payment anomalies.
        </p>
        
        {metrics && (
          <div className={styles.grid}>
            <div className={styles.metricCard}>
              <label>PR-AUC</label>
              <div className={styles.value}>{metrics.pr_auc?.toFixed(4)}</div>
            </div>
            <div className={styles.metricCard}>
              <label>ROC-AUC</label>
              <div className={styles.value}>{metrics.roc_auc?.toFixed(4)}</div>
            </div>
            <div className={styles.metricCard}>
              <label>Precision</label>
              <div className={styles.value}>{(metrics.precision * 100)?.toFixed(2)}%</div>
            </div>
            <div className={styles.metricCard}>
              <label>Recall</label>
              <div className={styles.value}>{(metrics.recall * 100)?.toFixed(2)}%</div>
            </div>
            <div className={styles.metricCard}>
              <label>F1 Score</label>
              <div className={styles.value}>{metrics.f1?.toFixed(4)}</div>
            </div>
            <div className={styles.metricCard}>
              <label>FPR</label>
              <div className={styles.value}>{(metrics.fpr * 100)?.toFixed(2)}%</div>
            </div>
            <div className={styles.metricCard}>
              <label>Brier Score</label>
              <div className={styles.value}>{metrics.brier_score?.toFixed(4)}</div>
            </div>
            <div className={styles.metricCard}>
              <label>Threshold</label>
              <div className={styles.value}>{metrics.threshold?.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
