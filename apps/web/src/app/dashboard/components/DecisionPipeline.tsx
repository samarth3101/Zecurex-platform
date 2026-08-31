'use client';

import React from 'react';
import { CreditCard, Cpu, Activity, ShieldAlert, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { RiskAssessmentRecord, InvestigationRecord, TransactionRecord } from '@/lib/api';
import styles from './DecisionPipeline.module.scss';

interface DecisionPipelineProps {
  transaction: TransactionRecord;
  riskAssessment?: RiskAssessmentRecord | null;
  investigation?: InvestigationRecord | null;
}

export default function DecisionPipeline({ transaction, riskAssessment, investigation }: DecisionPipelineProps) {
  const hasRisk = Boolean(riskAssessment);
  const isReview = riskAssessment?.decision === 'REVIEW';
  const hasInvestigation = Boolean(investigation && investigation.status === 'COMPLETED');
  const finalRecommendation = investigation?.recommendation || riskAssessment?.decision || 'PENDING';

  return (
    <div className={styles.pipelineContainer}>
      <div className={styles.header}>
        <span className={styles.label}>END-TO-END INTELLIGENCE PIPELINE</span>
        <span className={styles.subtext}>Deterministic policy bounds AI investigation</span>
      </div>

      <div className={styles.stagesRow}>
        {/* 1. Payment */}
        <div className={`${styles.stage} ${styles.completed}`}>
          <div className={styles.stageIconWrap}>
            <CreditCard size={14} />
          </div>
          <div className={styles.stageContent}>
            <span className={styles.stageName}>1. Payment</span>
            <span className={styles.stageMeta}>₹{transaction.amount.toLocaleString()} · {transaction.method.toUpperCase()}</span>
          </div>
        </div>

        <ChevronRight className={styles.arrow} size={14} />

        {/* 2. Behavioral Features */}
        <div className={`${styles.stage} ${styles.completed}`}>
          <div className={styles.stageIconWrap}>
            <Activity size={14} />
          </div>
          <div className={styles.stageContent}>
            <span className={styles.stageName}>2. Behavior</span>
            <span className={styles.stageMeta}>46 point-in-time signals</span>
          </div>
        </div>

        <ChevronRight className={styles.arrow} size={14} />

        {/* 3. ML Risk Engine */}
        <div className={`${styles.stage} ${hasRisk ? styles.completed : styles.pending}`}>
          <div className={styles.stageIconWrap}>
            <Cpu size={14} />
          </div>
          <div className={styles.stageContent}>
            <span className={styles.stageName}>3. ML Risk Engine</span>
            <span className={styles.stageMeta}>
              {riskAssessment ? `Score: ${(riskAssessment.risk_score * 100).toFixed(0)}% (${riskAssessment.risk_level})` : 'Computing...'}
            </span>
          </div>
        </div>

        <ChevronRight className={styles.arrow} size={14} />

        {/* 4. Risk Policy */}
        <div className={`${styles.stage} ${hasRisk ? styles.completed : styles.pending}`}>
          <div className={styles.stageIconWrap}>
            <ShieldAlert size={14} />
          </div>
          <div className={styles.stageContent}>
            <span className={styles.stageName}>4. Risk Policy</span>
            <span className={`${styles.stageMeta} ${isReview ? styles.alertText : ''}`}>
              {riskAssessment ? `Decision: ${riskAssessment.decision}` : 'Evaluating...'}
            </span>
          </div>
        </div>

        <ChevronRight className={styles.arrow} size={14} />

        {/* 5. AI Investigation */}
        <div className={`${styles.stage} ${hasInvestigation ? styles.completed : isReview ? styles.active : styles.idle}`}>
          <div className={styles.stageIconWrap}>
            <Sparkles size={14} />
          </div>
          <div className={styles.stageContent}>
            <span className={styles.stageName}>5. AI Agent</span>
            <span className={styles.stageMeta}>
              {hasInvestigation ? `Grounded (${investigation?.confidence || 'High'})` : isReview ? 'Investigating...' : 'Not Triggered'}
            </span>
          </div>
        </div>

        <ChevronRight className={styles.arrow} size={14} />

        {/* 6. Operator Decision */}
        <div className={`${styles.stage} ${hasRisk ? styles.completed : styles.pending}`}>
          <div className={styles.stageIconWrap}>
            <CheckCircle2 size={14} />
          </div>
          <div className={styles.stageContent}>
            <span className={styles.stageName}>6. Decision</span>
            <span className={`${styles.stageMeta} ${styles.decisionBadge}`}>
              {finalRecommendation}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
