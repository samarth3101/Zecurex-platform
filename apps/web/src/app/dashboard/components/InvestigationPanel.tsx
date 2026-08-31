'use client';

import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, ShieldCheck, Scale } from 'lucide-react';
import { InvestigationRecord, RiskAssessmentRecord } from '@/lib/api';
import styles from './InvestigationPanel.module.scss';

interface InvestigationPanelProps {
  investigation?: InvestigationRecord | null;
  riskAssessment?: RiskAssessmentRecord | null;
}

export default function InvestigationPanel({ investigation, riskAssessment }: InvestigationPanelProps) {
  if (!investigation) {
    if (riskAssessment?.decision === 'ALLOW') {
      return (
        <div className={styles.panelContainer}>
          <div className={styles.header}>
            <span className={styles.label}>AI INVESTIGATION</span>
            <span className={styles.subtext}>Grounded in deterministic evidence</span>
          </div>
          <div className={styles.notTriggered}>
            <ShieldCheck className={styles.idleIcon} size={24} />
            <div className={styles.idleText}>
              <h5>Investigation Not Required</h5>
              <p>Risk assessment decision is <strong>ALLOW</strong> (risk score {(riskAssessment.risk_score * 100).toFixed(0)}% below 45% threshold). AI agent execution was bypassed to conserve latency and compute.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.panelContainer}>
        <div className={styles.header}>
          <span className={styles.label}>AI INVESTIGATION</span>
          <span className={styles.subtext}>Grounded in deterministic evidence</span>
        </div>
        <div className={styles.notTriggered}>
          <HelpCircle className={styles.idleIcon} size={24} />
          <div className={styles.idleText}>
            <h5>Investigation Pending or Unavailable</h5>
            <p>Deterministic risk assessment remains available. If this payment requires review, an investigation agent will examine the behavioral telemetry.</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    summary,
    severity = 'HIGH',
    confidence = 'HIGH',
    reasoning,
    key_findings = [],
    recommendation = 'REVIEW',
    agent_model = 'Gemini 2.5 Flash',
    agent_version = '1.0.0',
    completed_at
  } = investigation;

  const getSeverityBadge = () => {
    switch (severity) {
      case 'CRITICAL':
        return <span className={`${styles.badge} ${styles.critical}`}><AlertOctagon size={12} /> CRITICAL SEVERITY</span>;
      case 'HIGH':
        return <span className={`${styles.badge} ${styles.high}`}><AlertTriangle size={12} /> HIGH SEVERITY</span>;
      case 'MEDIUM':
        return <span className={`${styles.badge} ${styles.medium}`}><AlertTriangle size={12} /> MEDIUM SEVERITY</span>;
      default:
        return <span className={`${styles.badge} ${styles.low}`}><CheckCircle2 size={12} /> LOW SEVERITY</span>;
    }
  };

  const getRecommendationBadge = () => {
    switch (recommendation) {
      case 'ESCALATE':
        return <span className={`${styles.recBadge} ${styles.escalate}`}>ESCALATE</span>;
      case 'REVIEW':
        return <span className={`${styles.recBadge} ${styles.review}`}>REVIEW</span>;
      case 'MONITOR':
        return <span className={`${styles.recBadge} ${styles.monitor}`}>MONITOR</span>;
      default:
        return <span className={`${styles.recBadge} ${styles.allow}`}>ALLOW</span>;
    }
  };

  return (
    <div className={styles.panelContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.labelGroup}>
            <Sparkles className={styles.sparkleIcon} size={14} />
            <span className={styles.label}>AI INVESTIGATION</span>
          </div>
          <span className={styles.subtext}>Grounded in deterministic evidence.</span>
        </div>

        <div className={styles.metaRow}>
          {getSeverityBadge()}
          <span className={styles.confidencePill}>
            CONFIDENCE: <strong>{confidence}</strong>
          </span>
          <span className={styles.agentPill}>
            {agent_model} (v{agent_version})
          </span>
        </div>
      </div>

      {/* Structured Investigation Content */}
      <div className={styles.contentSections}>
        {/* Executive Summary */}
        {summary && (
          <div className={styles.summaryBox}>
            <span className={styles.sectionHeader}>EXECUTIVE SUMMARY</span>
            <p className={styles.summaryText}>{summary}</p>
          </div>
        )}

        {/* What Happened & Why Flagged */}
        {reasoning && (
          <div className={styles.reasoningGrid}>
            <div className={styles.reasoningCard}>
              <span className={styles.sectionHeader}>WHAT HAPPENED</span>
              <p>{reasoning.what_happened}</p>
            </div>

            <div className={styles.reasoningCard}>
              <span className={styles.sectionHeader}>WHY IT WAS FLAGGED</span>
              <p>{reasoning.why_flagged}</p>
            </div>

            {reasoning.what_changed_from_normal && (
              <div className={styles.reasoningCard}>
                <span className={styles.sectionHeader}>WHAT CHANGED FROM NORMAL</span>
                <p>{reasoning.what_changed_from_normal}</p>
              </div>
            )}

            {reasoning.evidence_weakening_concern && (
              <div className={styles.reasoningCard}>
                <span className={styles.sectionHeader}>ALTERNATIVE EXPLANATIONS / MITIGATING FACTORS</span>
                <p>{reasoning.evidence_weakening_concern}</p>
              </div>
            )}
          </div>
        )}

        {/* Key Findings List */}
        {key_findings && key_findings.length > 0 && (
          <div className={styles.findingsBox}>
            <span className={styles.sectionHeader}>KEY FINDINGS</span>
            <ul className={styles.findingsList}>
              {key_findings.map((finding, idx) => (
                <li key={idx}>
                  <span className={styles.bullet} />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bounded Recommendation Callout */}
        <div className={styles.recommendationCallout}>
          <div className={styles.recHeader}>
            <div className={styles.recTitle}>
              <Scale size={16} className={styles.scaleIcon} />
              <span>BOUNDED AGENT RECOMMENDATION</span>
            </div>
            {getRecommendationBadge()}
          </div>

          <div className={styles.recPolicyNote}>
            AI recommends <strong>{recommendation}</strong>. Final authorization remains controlled by deterministic policy.
          </div>

          {completed_at && (
            <div className={styles.timestamp}>
              Investigation finalized at {new Date(completed_at).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
