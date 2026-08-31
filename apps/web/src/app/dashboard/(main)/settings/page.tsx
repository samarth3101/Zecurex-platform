'use client';

import React from 'react';
import { Sliders, Server, Shield, Sparkles, Database, CheckCircle2, Lock, Cpu } from 'lucide-react';
import styles from './settings.module.scss';

export default function SettingsDiagnosticsPage() {
  return (
    <div className={styles.container}>
      {/* Overview */}
      <div className={styles.headerCard}>
        <div className={styles.titleGroup}>
          <Sliders size={16} className={styles.icon} />
          <h2>CONTROL ROOM DIAGNOSTICS & SYSTEM CONFIGURATION</h2>
        </div>
        <p className={styles.subtext}>
          Active operational parameters, decision thresholds, and AI provider configurations for the Zecure platform.
        </p>
      </div>

      {/* Grid of config panels */}
      <div className={styles.grid}>
        {/* Risk Policy Thresholds */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Shield size={14} className={styles.cardIcon} />
            <h3>DETERMINISTIC RISK POLICY</h3>
          </div>
          <p className={styles.cardDesc}>
            Risk thresholds determine automatic authorization vs triggering AI-assisted agent investigation.
          </p>

          <div className={styles.configRows}>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>ALLOW Threshold</span>
              <span className={`${styles.cfgVal} ${styles.allow}`}>Risk Score &lt; 0.45</span>
            </div>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>REVIEW Threshold</span>
              <span className={`${styles.cfgVal} ${styles.review}`}>Risk Score &ge; 0.45</span>
            </div>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>CRITICAL Threshold</span>
              <span className={`${styles.cfgVal} ${styles.critical}`}>Risk Score &ge; 0.85</span>
            </div>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Authoritative Policy Boundary</span>
              <span className={styles.cfgVal}>Deterministic Rules (Centralized)</span>
            </div>
          </div>
        </div>

        {/* ML Risk Engine */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Cpu size={14} className={styles.cardIcon} />
            <h3>ML CLASSIFIER ARCHITECTURE</h3>
          </div>
          <p className={styles.cardDesc}>
            Real-time behavioral probability engine executed on incoming payment payloads.
          </p>

          <div className={styles.configRows}>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Model Architecture</span>
              <span className={styles.cfgVal}>Calibrated Random Forest</span>
            </div>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Feature Dimensions</span>
              <span className={styles.cfgVal}>46 Point-in-Time Features</span>
            </div>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Inference Latency</span>
              <span className={styles.cfgVal}>&lt; 15ms</span>
            </div>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Model Version</span>
              <span className={styles.cfgVal}>rf_production_v1.0</span>
            </div>
          </div>
        </div>

        {/* AI Investigation Agent */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Sparkles size={14} className={styles.cardIcon} />
            <h3>AI INVESTIGATION AGENT</h3>
          </div>
          <p className={styles.cardDesc}>
            Grounded LLM agent providing structured explanations and bounded recommendations.
          </p>

          <div className={styles.configRows}>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Primary Model</span>
              <span className={styles.cfgVal}>Gemini 2.5 Flash</span>
            </div>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Output Schema</span>
              <span className={styles.cfgVal}>Strict Structured JSON (Pydantic)</span>
            </div>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Bounded Actions</span>
              <span className={styles.cfgVal}>ALLOW / MONITOR / REVIEW / ESCALATE</span>
            </div>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Evidence Grounding</span>
              <span className={styles.cfgVal}>100% Provenance-Linked</span>
            </div>
          </div>
        </div>

        {/* Infrastructure & Security */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Server size={14} className={styles.cardIcon} />
            <h3>INFRASTRUCTURE & GOVERNANCE</h3>
          </div>
          <p className={styles.cardDesc}>
            Persistence, secure session authentication, and auditable event tracking.
          </p>

          <div className={styles.configRows}>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Database</span>
              <span className={styles.cfgVal}><Database size={11} /> PostgreSQL (JSONB)</span>
            </div>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Audit Trail</span>
              <span className={styles.cfgVal}><CheckCircle2 size={11} /> Point-in-time Event Diffing</span>
            </div>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Authentication</span>
              <span className={styles.cfgVal}><Lock size={11} /> HttpOnly Secure Session Cookies</span>
            </div>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Environment</span>
              <span className={styles.cfgVal}>Live Demo Pipeline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
