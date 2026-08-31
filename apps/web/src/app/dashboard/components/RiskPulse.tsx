'use client';

import React from 'react';
import { ShieldAlert, Activity, Search, ShieldCheck } from 'lucide-react';
import { TransactionRecord } from '@/lib/api';
import styles from './RiskPulse.module.scss';

interface RiskPulseProps {
  transactions: TransactionRecord[];
  investigationCount?: number;
}

export default function RiskPulse({ transactions, investigationCount = 0 }: RiskPulseProps) {
  const total = transactions.length;
  const criticalCount = transactions.filter(t => t.risk_level === 'CRITICAL').length;
  const highCount = transactions.filter(t => t.risk_level === 'HIGH').length;
  const mediumCount = transactions.filter(t => t.risk_level === 'MEDIUM').length;
  const lowCount = transactions.filter(t => t.risk_level === 'LOW' || !t.risk_level).length;

  const totalHighRisk = criticalCount + highCount;
  const underReviewCount = transactions.filter(t => (t.risk_score && t.risk_score >= 0.45) || t.risk_level === 'HIGH' || t.risk_level === 'CRITICAL').length;

  const lowPct = total > 0 ? (lowCount / total) * 100 : 0;
  const medPct = total > 0 ? (mediumCount / total) * 100 : 0;
  const highPct = total > 0 ? (highCount / total) * 100 : 0;
  const critPct = total > 0 ? (criticalCount / total) * 100 : 0;

  return (
    <div className={styles.riskPulseContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.label}>OPERATIONAL TELEMETRY</span>
          <h3 className={styles.heading}>Risk Pulse</h3>
        </div>
        <div className={styles.liveIndicator}>
          <span className={styles.pulseDot} />
          <span className={styles.pulseText}>MONITORING ACTIVE</span>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricItem}>
          <div className={styles.metricHeader}>
            <Activity className={styles.metricIcon} size={15} />
            <span>Monitored</span>
          </div>
          <div className={styles.metricValue}>{total}</div>
          <div className={styles.metricSub}>Live feed window</div>
        </div>

        <div className={styles.metricItem}>
          <div className={styles.metricHeader}>
            <ShieldAlert className={`${styles.metricIcon} ${styles.highRisk}`} size={15} />
            <span>High Risk Flagged</span>
          </div>
          <div className={`${styles.metricValue} ${styles.highRisk}`}>{totalHighRisk}</div>
          <div className={styles.metricSub}>{criticalCount} critical · {highCount} high</div>
        </div>

        <div className={styles.metricItem}>
          <div className={styles.metricHeader}>
            <Search className={`${styles.metricIcon} ${styles.reviewRisk}`} size={15} />
            <span>Under Review</span>
          </div>
          <div className={`${styles.metricValue} ${styles.reviewRisk}`}>{underReviewCount}</div>
          <div className={styles.metricSub}>Deterministic policy</div>
        </div>

        <div className={styles.metricItem}>
          <div className={styles.metricHeader}>
            <ShieldCheck className={styles.metricIcon} size={15} />
            <span>AI Investigations</span>
          </div>
          <div className={styles.metricValue}>{investigationCount || underReviewCount}</div>
          <div className={styles.metricSub}>Gemini agent grounded</div>
        </div>
      </div>

      <div className={styles.distributionWrapper}>
        <div className={styles.distributionHeader}>
          <span className={styles.distLabel}>Risk Distribution</span>
          <div className={styles.legend}>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.low}`} /> LOW ({lowCount})</span>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.medium}`} /> MED ({mediumCount})</span>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.high}`} /> HIGH ({highCount})</span>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.critical}`} /> CRIT ({criticalCount})</span>
          </div>
        </div>

        <div className={styles.distributionBar}>
          {total > 0 ? (
            <>
              <div className={`${styles.barSegment} ${styles.low}`} style={{ width: `${lowPct}%` }} title={`Low Risk: ${lowCount}`} />
              <div className={`${styles.barSegment} ${styles.medium}`} style={{ width: `${medPct}%` }} title={`Medium Risk: ${mediumCount}`} />
              <div className={`${styles.barSegment} ${styles.high}`} style={{ width: `${highPct}%` }} title={`High Risk: ${highCount}`} />
              <div className={`${styles.barSegment} ${styles.critical}`} style={{ width: `${critPct}%` }} title={`Critical Risk: ${criticalCount}`} />
            </>
          ) : (
            <div className={styles.emptyBar} />
          )}
        </div>
      </div>
    </div>
  );
}
