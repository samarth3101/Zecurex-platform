'use client';

import React from 'react';
import { Gauge, Zap, TrendingUp, CreditCard, Globe, Network, AlertCircle, CheckCircle } from 'lucide-react';
import { RiskAssessmentRecord, InvestigationRecord } from '@/lib/api';
import styles from './BehavioralSignals.module.scss';

interface BehavioralSignalsProps {
  riskAssessment?: RiskAssessmentRecord | null;
  investigation?: InvestigationRecord | null;
}

export default function BehavioralSignals({ riskAssessment, investigation }: BehavioralSignalsProps) {
  const topSignals = riskAssessment?.risk_factors?.top_signals || [];
  const anomalies = investigation?.evidence?.anomalies || [];

  const getSignalIcon = (feature: string) => {
    const f = feature.toLowerCase();
    if (f.includes('velocity') || f.includes('count') || f.includes('freq')) return <Zap size={14} />;
    if (f.includes('amount') || f.includes('deviation') || f.includes('ratio')) return <TrendingUp size={14} />;
    if (f.includes('method') || f.includes('card') || f.includes('upi')) return <CreditCard size={14} />;
    if (f.includes('geo') || f.includes('country') || f.includes('ip')) return <Globe size={14} />;
    if (f.includes('network') || f.includes('device') || f.includes('user_agent')) return <Network size={14} />;
    return <Gauge size={14} />;
  };

  return (
    <div className={styles.signalsContainer}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.label}>POINT-IN-TIME RISK FACTORS</span>
          <span className={styles.badge}>46 BEHAVIORAL FEATURES</span>
        </div>
        <h4 className={styles.heading}>Behavioral Signals</h4>
        <p className={styles.subtext}>
          Zecure analyzes the surrounding behavioral footprint rather than solely evaluating transaction amount.
        </p>
      </div>

      {topSignals.length > 0 ? (
        <div className={styles.signalsGrid}>
          {topSignals.map((sig, idx) => {
            const isAbnormal = sig.description.toLowerCase().includes('high') || 
                               sig.description.toLowerCase().includes('anomal') || 
                               sig.description.toLowerCase().includes('elevated') ||
                               sig.description.toLowerCase().includes('unusual') ||
                               sig.description.toLowerCase().includes('spike');
            return (
              <div key={idx} className={`${styles.signalCard} ${isAbnormal ? styles.flagged : styles.normal}`}>
                <div className={styles.signalTop}>
                  <div className={styles.signalTitle}>
                    <span className={styles.iconWrap}>{getSignalIcon(sig.feature)}</span>
                    <span className={styles.featureName}>{sig.feature.replace(/_/g, ' ')}</span>
                  </div>
                  {isAbnormal ? (
                    <span className={styles.anomalyBadge}><AlertCircle size={12} /> ANOMALY</span>
                  ) : (
                    <span className={styles.normalBadge}><CheckCircle size={12} /> BASELINE</span>
                  )}
                </div>

                <div className={styles.observedRow}>
                  <span className={styles.observedLabel}>Observed Value:</span>
                  <span className={styles.observedVal}>
                    {typeof sig.value === 'number' 
                      ? (sig.value % 1 === 0 ? sig.value : sig.value.toFixed(2))
                      : String(sig.value ?? 'N/A')}
                  </span>
                </div>

                <p className={styles.description}>{sig.description}</p>
              </div>
            );
          })}
        </div>
      ) : anomalies.length > 0 ? (
        <div className={styles.signalsGrid}>
          {anomalies.map((anom, idx) => (
            <div key={idx} className={`${styles.signalCard} ${styles.flagged}`}>
              <div className={styles.signalTop}>
                <div className={styles.signalTitle}>
                  <span className={styles.iconWrap}>{getSignalIcon(anom.signal)}</span>
                  <span className={styles.featureName}>{anom.signal.replace(/_/g, ' ')}</span>
                </div>
                <span className={styles.anomalyBadge}><AlertCircle size={12} /> ANOMALY</span>
              </div>

              <div className={styles.observedRow}>
                <span className={styles.observedLabel}>Observed:</span>
                <span className={styles.observedVal}>{String(anom.observed_value)}</span>
                {anom.baseline_value && (
                  <span className={styles.baselineVal}> (Base: {String(anom.baseline_value)})</span>
                )}
              </div>

              <p className={styles.description}>{anom.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptySignals}>
          <Gauge size={20} className={styles.emptyIcon} />
          <p>All 46 behavioral signals conform to the customer&apos;s established baseline pattern.</p>
        </div>
      )}
    </div>
  );
}
