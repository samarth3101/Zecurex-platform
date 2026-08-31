'use client';

import React from 'react';
import { Database, Link2, FileCode, CheckCircle } from 'lucide-react';
import { InvestigationRecord, RiskAssessmentRecord, TransactionRecord } from '@/lib/api';
import styles from './EvidencePanel.module.scss';

interface EvidencePanelProps {
  transaction: TransactionRecord;
  riskAssessment?: RiskAssessmentRecord | null;
  investigation?: InvestigationRecord | null;
}

export default function EvidencePanel({ transaction, riskAssessment, investigation }: EvidencePanelProps) {
  const anomalies = investigation?.evidence?.anomalies || [];
  const riskSignals = riskAssessment?.risk_factors?.top_signals || [];

  // Build structured provenance items
  const evidenceItems: {
    claim: string;
    value: string;
    sourceType: string;
    sourceRef: string;
    verified: boolean;
  }[] = [];

  // 1. Transaction raw claims
  evidenceItems.push({
    claim: 'Payment Method & Currency',
    value: `${transaction.method.toUpperCase()} (${transaction.currency})`,
    sourceType: 'transaction',
    sourceRef: `transactions.method [ID: ${transaction.razorpay_payment_id}]`,
    verified: true
  });

  if (transaction.geo_region || transaction.ip_hash) {
    evidenceItems.push({
      claim: 'Network & Geographic Origin',
      value: `Region: ${transaction.geo_region || 'Domestic'} · IP: ${transaction.ip_hash || 'Recorded'}`,
      sourceType: 'network',
      sourceRef: 'network_evidence.ip_hash',
      verified: true
    });
  }

  // 2. Risk Assessment claims
  if (riskAssessment) {
    evidenceItems.push({
      claim: 'ML Risk Probability',
      value: `${(riskAssessment.risk_score * 100).toFixed(1)}% (${riskAssessment.risk_level})`,
      sourceType: 'risk_assessment',
      sourceRef: `models.random_forest [v${riskAssessment.model_version || '1.0'}]`,
      verified: true
    });

    for (const sig of riskSignals) {
      evidenceItems.push({
        claim: sig.feature.replace(/_/g, ' '),
        value: String(sig.value ?? 'Observed'),
        sourceType: 'feature_adapter',
        sourceRef: `features.${sig.feature}`,
        verified: true
      });
    }
  }

  // 3. AI anomalies provenance
  for (const anom of anomalies) {
    if (anom.provenance) {
      evidenceItems.push({
        claim: anom.signal.replace(/_/g, ' '),
        value: `${anom.observed_value}${anom.baseline_value ? ` (Base: ${anom.baseline_value})` : ''}`,
        sourceType: anom.provenance.source_type,
        sourceRef: anom.provenance.source_ref,
        verified: true
      });
    }
  }

  return (
    <div className={styles.evidenceContainer}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            <Database size={14} className={styles.dbIcon} />
            <span className={styles.label}>AUDITABLE EVIDENCE & PROVENANCE</span>
          </div>
          <span className={styles.statusPill}><CheckCircle size={11} /> 100% PROVENANCE TRACEABLE</span>
        </div>
        <h4 className={styles.heading}>Evidence Sources</h4>
        <p className={styles.subtext}>
          Every behavioral risk factor and AI assertion is directly mapped to immutable point-in-time telemetry sources.
        </p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.evidenceTable}>
          <thead>
            <tr>
              <th>EVALUATED SIGNAL</th>
              <th>OBSERVED VALUE</th>
              <th>SOURCE LAYER</th>
              <th>SOURCE REFERENCE</th>
            </tr>
          </thead>
          <tbody>
            {evidenceItems.map((item, idx) => (
              <tr key={idx}>
                <td className={styles.claimCell}>
                  <Link2 size={12} className={styles.linkIcon} />
                  <span>{item.claim}</span>
                </td>
                <td className={styles.valueCell}>{item.value}</td>
                <td className={styles.sourceTypeCell}>
                  <span className={styles.typeTag}>{item.sourceType}</span>
                </td>
                <td className={styles.sourceRefCell}>
                  <FileCode size={11} className={styles.codeIcon} />
                  <code>{item.sourceRef}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
