/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useEffect, useState } from 'react';
import { ZecureAPI } from '@/lib/api';
import styles from './TransactionDetail.module.scss';

export default function TransactionDetail({ transactionId, onClose }: { transactionId: string, onClose: () => void }) {
  const [data, setData] = useState<{
    tx: any,
    risk: any,
    inv: any,
    audit: any[]
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tx, risk, inv, audit] = await Promise.all([
          ZecureAPI.getTransaction(transactionId).catch(() => null),
          ZecureAPI.getRiskAssessment(transactionId).catch(() => null),
          ZecureAPI.getInvestigation(transactionId).catch(() => null),
          ZecureAPI.getAuditTrail(transactionId).catch(() => [])
        ]);
        
        if (mounted) {
          setData({ tx, risk, inv, audit });
          setError('');
        }
      } catch (err: any) {
        if (mounted) setError('Failed to load detail: ' + err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchData();
    
    return () => { mounted = false; };
  }, [transactionId]);

  if (loading) {
    return <div className={styles.loading}>Loading detail...</div>;
  }

  if (error || !data || !data.tx) {
    return <div className={styles.error}>{error || 'Transaction not found'}</div>;
  }

  const { tx, risk, inv, audit } = data;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h3>Transaction Detail</h3>
          <span className={styles.txId}>{tx.id}</span>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
      </header>

      <div className={styles.scrollArea}>
        <section className={styles.section}>
          <h4>Overview</h4>
          <div className={styles.grid}>
            <div className={styles.metric}>
              <label>Amount</label>
              <span>₹{tx.amount.toLocaleString()}</span>
            </div>
            <div className={styles.metric}>
              <label>Status</label>
              <span className={styles.statusBadge}>{tx.status}</span>
            </div>
            <div className={styles.metric}>
              <label>Method</label>
              <span>{tx.method.toUpperCase()}</span>
            </div>
          </div>
        </section>

        {risk && (
          <section className={styles.section}>
            <h4>Risk Assessment</h4>
            <div className={`${styles.riskBanner} ${styles[risk.risk_level?.toLowerCase() || 'low']}`}>
              <div className={styles.riskScore}>
                <span className={styles.score}>{risk.risk_score?.toFixed(2) || 'N/A'}</span>
                <span className={styles.level}>{risk.risk_level || 'UNKNOWN'} RISK</span>
              </div>
              <div className={styles.decision}>
                Decision: <strong>{risk.decision}</strong>
              </div>
            </div>
            
            {risk.risk_factors?.top_signals && risk.risk_factors.top_signals.length > 0 && (
              <div className={styles.signalsContainer}>
                <h5>Behavioral Signals</h5>
                <ul className={styles.signalsList}>
                  {risk.risk_factors.top_signals.map((sig: any, idx: number) => (
                    <li key={idx}>
                      <span className={styles.sigFeature}>{sig.feature}</span>
                      <span className={styles.sigDesc}>{sig.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {inv && (
          <section className={styles.section}>
            <h4>AI Investigation</h4>
            <div className={styles.investigationCard}>
              <div className={styles.invStatus}>
                Status: {inv.status} | Confidence: {inv.confidence}
              </div>
              <div className={styles.reasoning}>
                {inv.summary && <p>{inv.summary}</p>}
                
                {inv.key_findings && inv.key_findings.length > 0 && (
                  <div className={styles.keyFindings}>
                    <h5>Key Findings:</h5>
                    <ul>
                      {inv.key_findings.map((finding: string, idx: number) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {inv.recommendation && (
                  <div className={styles.recommendation}>
                    <strong>Recommendation:</strong> {inv.recommendation}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h4>Auditable Activity Trail</h4>
          <div className={styles.auditList}>
            {audit.map((event, idx) => (
              <div key={event.id || idx} className={styles.auditEvent}>
                <div className={styles.auditTime}>{new Date(event.created_at).toLocaleTimeString()}</div>
                <div className={styles.auditContent}>
                  <strong>{event.actor_type}</strong> - {event.action}
                </div>
              </div>
            ))}
            {audit.length === 0 && <div className={styles.emptyAudit}>No activity recorded yet.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
