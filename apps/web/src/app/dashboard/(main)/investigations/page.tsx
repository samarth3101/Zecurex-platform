'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Search, RefreshCw, ArrowUpRight, ShieldAlert, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ZecureAPI, InvestigationRecord } from '@/lib/api';
import TransactionDetail from '../../components/TransactionDetail';
import styles from './investigations.module.scss';

export default function InvestigationsQueuePage() {
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const fetchInvestigations = async () => {
    setIsLoading(true);
    try {
      const data = await ZecureAPI.getInvestigations(100);
      setInvestigations(data);
    } catch (err) {
      console.error('Failed to load investigations queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const filtered = investigations.filter((inv) => {
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && inv.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = inv.transaction_id?.toLowerCase().includes(q);
      const sumMatch = inv.summary?.toLowerCase().includes(q);
      const recMatch = inv.recommendation?.toLowerCase().includes(q);
      if (!idMatch && !sumMatch && !recMatch) return false;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      {/* Header Controls */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by transaction ID, summary, or recommendation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filtersGroup}>
          <div className={styles.filterItem}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className={styles.filterItem}>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Severity</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low Severity</option>
            </select>
          </div>

          <button className={styles.refreshBtn} onClick={fetchInvestigations} disabled={isLoading}>
            <RefreshCw size={13} className={isLoading ? styles.spin : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Queue Table */}
      <div className={styles.tableCard}>
        {isLoading && investigations.length === 0 ? (
          <div className={styles.loadingBox}>
            <Loader2 size={24} className={styles.spin} />
            <span>Loading AI investigation queue...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>TRANSACTION ID</th>
                  <th>RISK SCORE</th>
                  <th>SEVERITY</th>
                  <th>STATUS</th>
                  <th>AGENT RECOMMENDATION</th>
                  <th>CONFIDENCE</th>
                  <th>AGENT MODEL</th>
                  <th>COMPLETED AT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const riskLevel = inv.risk_level || 'HIGH';
                  const riskScoreDisplay = inv.risk_score !== null && inv.risk_score !== undefined
                    ? `${(inv.risk_score * 100).toFixed(0)}%`
                    : '--';
                  const severity = inv.severity || 'HIGH';
                  const rec = inv.recommendation || 'REVIEW';

                  return (
                    <tr 
                      key={inv.investigation_id} 
                      onClick={() => setSelectedTxId(inv.transaction_id)}
                      className={styles.clickableRow}
                    >
                      <td className={styles.idCell}>
                        <span className={styles.primaryId}>{inv.transaction_id.substring(0, 18)}...</span>
                      </td>
                      <td className={styles.scoreCell}>
                        <span>{riskScoreDisplay}</span>
                        <span className={`${styles.riskLevelTag} ${styles[riskLevel.toLowerCase()]}`}>
                          {riskLevel}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.severityBadge} ${styles[severity.toLowerCase()]}`}>
                          {severity}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusPill} ${styles[inv.status.toLowerCase()]}`}>
                          {inv.status === 'COMPLETED' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                          <span>{inv.status}</span>
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.recBadge} ${styles[rec.toLowerCase()]}`}>
                          {rec}
                        </span>
                      </td>
                      <td className={styles.monoCell}>{inv.confidence || 'HIGH'}</td>
                      <td className={styles.agentCell}>
                        <Sparkles size={11} className={styles.sparkleIcon} />
                        <span>{inv.agent_model || 'Gemini 2.5 Flash'}</span>
                      </td>
                      <td className={styles.timeCell}>
                        {inv.completed_at ? new Date(inv.completed_at).toLocaleTimeString() : 'In Progress'}
                      </td>
                      <td className={styles.actionCell}>
                        <button 
                          className={styles.drillBtn} 
                          onClick={(e) => { e.stopPropagation(); setSelectedTxId(inv.transaction_id); }}
                          title="Open AI Reasoning"
                        >
                          <ArrowUpRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <ShieldAlert size={28} className={styles.emptyIcon} />
            <h4>No Investigations in Queue</h4>
            <p>No transactions have triggered an AI investigation review yet.</p>
          </div>
        )}
      </div>

      {/* Drill-down Drawer */}
      {selectedTxId && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedTxId(null)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <TransactionDetail transactionId={selectedTxId} onClose={() => setSelectedTxId(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
