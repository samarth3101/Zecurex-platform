'use client';

import React, { useEffect, useState } from 'react';
import { X, ShieldAlert, CreditCard, User, Globe, Network, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { 
  ZecureAPI, 
  TransactionRecord, 
  RiskAssessmentRecord, 
  InvestigationRecord, 
  AuditEventRecord 
} from '@/lib/api';
import DecisionPipeline from './DecisionPipeline';
import BehavioralSignals from './BehavioralSignals';
import InvestigationPanel from './InvestigationPanel';
import EvidencePanel from './EvidencePanel';
import AuditTimeline from './AuditTimeline';
import styles from './TransactionDetail.module.scss';

interface TransactionDetailProps {
  transactionId: string;
  onClose?: () => void;
}

export default function TransactionDetail({ transactionId, onClose }: TransactionDetailProps) {
  const [data, setData] = useState<{
    tx: TransactionRecord | null;
    risk: RiskAssessmentRecord | null;
    inv: InvestigationRecord | null;
    audit: AuditEventRecord[];
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'INTELLIGENCE' | 'BEHAVIOR' | 'INVESTIGATION' | 'EVIDENCE' | 'AUDIT'>('INTELLIGENCE');

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
          setError(null);
        }
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load transaction data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchData();
    
    return () => { mounted = false; };
  }, [transactionId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Loader2 className={styles.spin} size={28} />
          <span>Retrieving behavioral risk signals and AI evidence...</span>
        </div>
      </div>
    );
  }

  if (error || !data || !data.tx) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <ShieldAlert size={28} />
          <h4>Transaction Intelligence Unavailable</h4>
          <p>{error || 'Unable to locate transaction record in database.'}</p>
          {onClose && <button onClick={onClose} className={styles.backBtn}>Return to Feed</button>}
        </div>
      </div>
    );
  }

  const { tx, risk, inv, audit } = data;
  const riskScoreVal = risk?.risk_score !== undefined && risk?.risk_score !== null ? (risk.risk_score * 100).toFixed(0) : '--';
  const riskLevel = risk?.risk_level || tx.risk_level || 'LOW';
  const decision = risk?.decision || (riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? 'REVIEW' : 'ALLOW');

  return (
    <div className={styles.container}>
      {/* Top Bar Header */}
      <header className={styles.header}>
        <div className={styles.headerMeta}>
          <span className={styles.sectionLabel}>TRANSACTION INTELLIGENCE WORKSPACE</span>
          <div className={styles.idRow}>
            <h2 className={styles.txId}>{tx.razorpay_payment_id || tx.id}</h2>
            <span className={styles.uuidBadge}>UUID: {tx.id.substring(0, 8)}...</span>
          </div>
        </div>
        {onClose && (
          <button className={styles.closeBtn} onClick={onClose} title="Close Workspace">
            <X size={18} />
          </button>
        )}
      </header>

      {/* Hero Telemetry Card */}
      <div className={styles.heroCard}>
        {/* Left: Key Payment Context */}
        <div className={styles.paymentContext}>
          <div className={styles.amountBlock}>
            <span className={styles.amountLabel}>TRANSACTION AMOUNT</span>
            <div className={styles.amountValue}>
              ₹{tx.amount.toLocaleString()} <span className={styles.currency}>{tx.currency}</span>
            </div>
          </div>

          <div className={styles.contextGrid}>
            <div className={styles.contextItem}>
              <CreditCard size={12} className={styles.ctxIcon} />
              <span>Method: <strong>{tx.method.toUpperCase()}</strong></span>
            </div>
            <div className={styles.contextItem}>
              <User size={12} className={styles.ctxIcon} />
              <span>Customer: <strong>{tx.customer_id ? tx.customer_id.substring(0, 14) : 'Anonymous'}</strong></span>
            </div>
            <div className={styles.contextItem}>
              <Globe size={12} className={styles.ctxIcon} />
              <span>Geo: <strong>{tx.geo_region || 'Domestic (IN)'}</strong></span>
            </div>
            <div className={styles.contextItem}>
              <Network size={12} className={styles.ctxIcon} />
              <span>IP: <strong>{tx.ip_hash ? tx.ip_hash.substring(0, 14) : 'Recorded'}</strong></span>
            </div>
            <div className={styles.contextItem}>
              <Clock size={12} className={styles.ctxIcon} />
              <span>Timestamp: <strong>{new Date(tx.created_at).toLocaleString()}</strong></span>
            </div>
            <div className={styles.contextItem}>
              <ShieldCheck size={12} className={styles.ctxIcon} />
              <span>Merchant: <strong>{tx.merchant_id || 'merch_default'}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Risk Score & Decision Gauge */}
        <div className={`${styles.riskGaugeBlock} ${styles[`risk_${riskLevel.toLowerCase()}`]}`}>
          <span className={styles.gaugeLabel}>ML RISK ASSESSMENT</span>
          <div className={styles.scoreRow}>
            <span className={styles.scoreNumber}>{riskScoreVal}</span>
            <span className={styles.scoreScale}>/ 100</span>
          </div>

          <div className={styles.badgeRow}>
            <span className={`${styles.riskLevelBadge} ${styles[riskLevel.toLowerCase()]}`}>
              {riskLevel} RISK
            </span>
            <span className={`${styles.decisionBadge} ${styles[decision.toLowerCase()]}`}>
              {decision}
            </span>
          </div>

          <span className={styles.modelMeta}>
            Engine: {risk?.model_name || 'Random Forest'} · v{risk?.model_version || '1.0'}
          </span>
        </div>
      </div>

      {/* Horizontal Decision Pipeline */}
      <DecisionPipeline transaction={tx} riskAssessment={risk} investigation={inv} />

      {/* Workspace Tabs */}
      <div className={styles.tabNav}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'INTELLIGENCE' ? styles.active : ''}`}
          onClick={() => setActiveTab('INTELLIGENCE')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'BEHAVIOR' ? styles.active : ''}`}
          onClick={() => setActiveTab('BEHAVIOR')}
        >
          Behavioral Signals ({risk?.risk_factors?.top_signals?.length || 46})
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'INVESTIGATION' ? styles.active : ''}`}
          onClick={() => setActiveTab('INVESTIGATION')}
        >
          AI Investigation {inv && `(${inv.recommendation || 'Grounded'})`}
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'EVIDENCE' ? styles.active : ''}`}
          onClick={() => setActiveTab('EVIDENCE')}
        >
          Evidence & Provenance
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'AUDIT' ? styles.active : ''}`}
          onClick={() => setActiveTab('AUDIT')}
        >
          Audit Trail ({audit.length})
        </button>
      </div>

      {/* Workspace Tab Content */}
      <div className={styles.workspaceBody}>
        {activeTab === 'INTELLIGENCE' && (
          <div className={styles.allPanels}>
            <BehavioralSignals riskAssessment={risk} investigation={inv} />
            <InvestigationPanel investigation={inv} riskAssessment={risk} />
            <EvidencePanel transaction={tx} riskAssessment={risk} investigation={inv} />
            <AuditTimeline events={audit} />
          </div>
        )}

        {activeTab === 'BEHAVIOR' && (
          <BehavioralSignals riskAssessment={risk} investigation={inv} />
        )}

        {activeTab === 'INVESTIGATION' && (
          <InvestigationPanel investigation={inv} riskAssessment={risk} />
        )}

        {activeTab === 'EVIDENCE' && (
          <EvidencePanel transaction={tx} riskAssessment={risk} investigation={inv} />
        )}

        {activeTab === 'AUDIT' && (
          <AuditTimeline events={audit} />
        )}
      </div>
    </div>
  );
}
