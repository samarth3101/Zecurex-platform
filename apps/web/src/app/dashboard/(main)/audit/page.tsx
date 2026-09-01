'use client';

import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, ArrowUpRight, ShieldAlert, Loader2, Sparkles, Shield, User, Clock } from 'lucide-react';
import { ZecureAPI, AuditEventRecord } from '@/lib/api';
import TransactionDetail from '../../components/TransactionDetail';
import styles from './audit.module.scss';

export default function AuditTrailExplorerPage() {
  const [events, setEvents] = useState<AuditEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actorFilter, setActorFilter] = useState('ALL');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const fetchAuditEvents = async () => {
    setIsLoading(true);
    try {
      const data = await ZecureAPI.getAllAuditEvents(100);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load audit events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditEvents();
  }, []);

  const filtered = events.filter((ev) => {
    if (actorFilter !== 'ALL' && ev.actor_type?.toLowerCase() !== actorFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = ev.transaction_id?.toLowerCase().includes(q);
      const actionMatch = ev.action?.toLowerCase().includes(q);
      const actorMatch = ev.actor_type?.toLowerCase().includes(q);
      if (!idMatch && !actionMatch && !actorMatch) return false;
    }
    return true;
  });

  const getActorIcon = (actor: string) => {
    const a = actor.toLowerCase();
    if (a.includes('agent') || a.includes('investigation') || a.includes('ai') || a.includes('gemini')) {
      return <Sparkles size={12} className={styles.agentIcon} />;
    }
    if (a.includes('risk') || a.includes('engine') || a.includes('policy')) {
      return <Shield size={12} className={styles.engineIcon} />;
    }
    return <User size={12} className={styles.userIcon} />;
  };

  return (
    <div className={styles.container}>
      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by transaction ID, action, or actor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filtersGroup}>
          <div className={styles.filterItem}>
            <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)}>
              <option value="ALL">All Actors</option>
              <option value="RiskEngine">RiskEngine</option>
              <option value="InvestigationAgent">InvestigationAgent</option>
              <option value="PolicyEngine">PolicyEngine</option>
              <option value="System">System</option>
            </select>
          </div>

          <button className={styles.refreshBtn} onClick={fetchAuditEvents} disabled={isLoading}>
            <RefreshCw size={13} className={isLoading ? styles.spin : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className={styles.tableCard}>
        {isLoading && events.length === 0 ? (
          <div className={styles.loadingBox}>
            <Loader2 size={24} className={styles.spin} />
            <span>Loading auditable activity events...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>TRANSACTION ID</th>
                  <th>ACTOR</th>
                  <th>ACTION</th>
                  <th>STATE TRANSITION / DATA</th>
                  <th>DRILL DOWN</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev) => {
                  const hasDetails = Boolean(ev.details && Object.keys(ev.details).length > 0);

                  return (
                    <tr 
                      key={ev.id} 
                      onClick={() => setSelectedTxId(ev.transaction_id)}
                      className={styles.clickableRow}
                    >
                      <td className={styles.timeCell}>
                        <Clock size={11} />
                        <span>{new Date(ev.created_at).toLocaleTimeString()}</span>
                      </td>
                      <td className={styles.idCell}>
                        <span className={styles.primaryId}>{ev.transaction_id.substring(0, 16)}...</span>
                      </td>
                      <td>
                        <div className={styles.actorBadge}>
                          {getActorIcon(ev.actor_type)}
                          <span>{ev.actor_type}</span>
                        </div>
                      </td>
                      <td className={styles.actionCell}>
                        <span className={styles.actionName}>{ev.action.replace(/_/g, ' ')}</span>
                      </td>
                      <td className={styles.dataCell}>
                        {hasDetails ? (
                          <code>{JSON.stringify(ev.details)}</code>
                        ) : (
                          <span className={styles.emptyVal}>--</span>
                        )}
                      </td>
                      <td className={styles.btnCell}>
                        <button 
                          className={styles.drillBtn}
                          onClick={(e) => { e.stopPropagation(); setSelectedTxId(ev.transaction_id); }}
                          title="View Transaction Workspace"
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
            <h4>No Audit Events Found</h4>
            <p>No activity records match your current filter parameters.</p>
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
