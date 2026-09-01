'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Server,
  Shield,
  Sparkles,
  Database,
  CheckCircle2,
  Lock,
  Cpu,
  Activity,
  Laptop,
} from 'lucide-react';
import { ZecureAPI, SecuritySessionRecord, SecurityEventRecord } from '@/lib/api';
import styles from './settings.module.scss';

export default function SettingsDiagnosticsPage() {
  const [sessions, setSessions] = useState<SecuritySessionRecord[]>([]);
  const [activities, setActivities] = useState<SecurityEventRecord[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadSecurityData = async () => {
    try {
      const [sessData, actData] = await Promise.all([
        ZecureAPI.getSecuritySessions().catch(() => []),
        ZecureAPI.getSecurityActivity().catch(() => [])
      ]);
      setSessions(sessData);
      setActivities(actData);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const handleRevoke = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await ZecureAPI.revokeSession(sessionId);
      await loadSecurityData();
    } catch {
      // Ignored
    } finally {
      setRevokingId(null);
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className={styles.container}>
      {/* Overview */}
      <div className={styles.headerCard}>
        <div className={styles.titleGroup}>
          <Sliders size={16} className={styles.icon} />
          <h2>CONTROL ROOM DIAGNOSTICS & SYSTEM CONFIGURATION</h2>
        </div>
        <p className={styles.subtext}>
          Active operational parameters, decision thresholds, active sessions, and security event trails for the Zecure platform.
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
              <span className={styles.cfgVal}><Lock size={11} /> Scrypt + Session Tokens</span>
            </div>
            <div className={styles.configRow}>
              <span className={styles.cfgKey}>Email Provider</span>
              <span className={styles.cfgVal}>DevelopmentEmailProvider</span>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Laptop size={14} className={styles.cardIcon} />
            <h3>ACTIVE SESSIONS</h3>
          </div>
          <p className={styles.cardDesc}>
            Authorized sessions recognized by the server. Revoking immediately destroys the session.
          </p>

          <div className={styles.sessionsList}>
            {sessions.length === 0 ? (
              <div className={styles.configRow}>
                <span className={styles.cfgKey}>Current Session (Default Operator)</span>
                <span className={styles.currentBadge}>ACTIVE</span>
              </div>
            ) : (
              sessions.map((sess) => (
                <div key={sess.id} className={styles.sessionItem}>
                  <div className={styles.sessionInfo}>
                    <span className={styles.sessionDevice}>
                      {sess.device_name}
                      {sess.is_current && <span className={styles.currentBadge}>Current</span>}
                    </span>
                    <span className={styles.sessionMeta}>
                      IP: {sess.ip_address || '127.0.0.1'} · Last active: {formatTimestamp(sess.last_seen_at)}
                    </span>
                  </div>
                  {!sess.is_current && (
                    <button
                      type="button"
                      disabled={revokingId === sess.id}
                      onClick={() => handleRevoke(sess.id)}
                      className={styles.revokeBtn}
                    >
                      {revokingId === sess.id ? 'Revoking...' : 'Revoke'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Activity */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Activity size={14} className={styles.cardIcon} />
            <h3>SECURITY ACTIVITY</h3>
          </div>
          <p className={styles.cardDesc}>
            Real-time audit log of operator authentications, step-up verifications, and credential events.
          </p>

          <div className={styles.activityList}>
            {activities.length === 0 ? (
              <div className={styles.configRow}>
                <span className={styles.cfgKey}>System Initialized</span>
                <span className={styles.cfgVal}>Audited</span>
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className={styles.activityItem}>
                  <div className={styles.activityLeft}>
                    <span className={styles.activityType}>{act.event_type}</span>
                    <span className={styles.activityDevice}>{act.device_info || 'Device'}</span>
                  </div>
                  <span className={styles.activityTime}>{formatTimestamp(act.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
