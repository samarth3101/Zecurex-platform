'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, CreditCard, Globe, ArrowUpRight, ShieldAlert, Loader2 } from 'lucide-react';
import { ZecureAPI, TransactionRecord } from '@/lib/api';
import TransactionDetail from '../../components/TransactionDetail';
import styles from './transactions.module.scss';

export default function TransactionsExplorerPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await ZecureAPI.getTransactions(100);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = transactions.filter((tx) => {
    if (methodFilter !== 'ALL' && tx.method?.toLowerCase() !== methodFilter.toLowerCase()) return false;
    if (riskFilter !== 'ALL' && tx.risk_level !== riskFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = tx.id?.toLowerCase().includes(q);
      const payMatch = tx.razorpay_payment_id?.toLowerCase().includes(q);
      const custMatch = tx.customer_id?.toLowerCase().includes(q);
      const merchMatch = tx.merchant_id?.toLowerCase().includes(q);
      if (!idMatch && !payMatch && !custMatch && !merchMatch) return false;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      {/* Search & Filters Header */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by ID, payment ref, customer, or merchant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filtersGroup}>
          <div className={styles.filterItem}>
            <Filter size={12} className={styles.filterIcon} />
            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
              <option value="ALL">All Methods</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>

          <div className={styles.filterItem}>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          <button className={styles.refreshBtn} onClick={fetchTransactions} disabled={isLoading}>
            <RefreshCw size={13} className={isLoading ? styles.spin : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className={styles.tableCard}>
        {isLoading && transactions.length === 0 ? (
          <div className={styles.loadingBox}>
            <Loader2 size={24} className={styles.spin} />
            <span>Loading transaction operations feed...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>TRANSACTION / PAYMENT ID</th>
                  <th>AMOUNT</th>
                  <th>METHOD</th>
                  <th>CUSTOMER ID</th>
                  <th>MERCHANT</th>
                  <th>RISK SCORE</th>
                  <th>RISK LEVEL</th>
                  <th>DECISION</th>
                  <th>TIMESTAMP</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => {
                  const riskLevel = tx.risk_level || 'LOW';
                  const riskScoreDisplay = tx.risk_score !== null && tx.risk_score !== undefined
                    ? `${(tx.risk_score * 100).toFixed(0)}%`
                    : '--';
                  const isReview = (tx.risk_score && tx.risk_score >= 0.45) || riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
                  const decision = isReview ? 'REVIEW' : 'ALLOW';

                  return (
                    <tr key={tx.id} onClick={() => setSelectedTxId(tx.id)} className={styles.clickableRow}>
                      <td className={styles.idCell}>
                        <span className={styles.primaryId}>{tx.razorpay_payment_id || tx.id.substring(0, 14)}</span>
                        <span className={styles.subId}>{tx.id.substring(0, 8)}...</span>
                      </td>
                      <td className={styles.amountCell}>
                        ₹{tx.amount.toLocaleString()} <span className={styles.currency}>{tx.currency}</span>
                      </td>
                      <td>
                        <div className={styles.methodCell}>
                          <CreditCard size={11} />
                          <span>{tx.method?.toUpperCase()}</span>
                          {tx.international && <span title="International"><Globe size={11} className={styles.intlIcon} /></span>}
                        </div>
                      </td>
                      <td className={styles.monoCell}>{tx.customer_id || 'cust_anon'}</td>
                      <td className={styles.monoCell}>{tx.merchant_id || 'merch_default'}</td>
                      <td className={styles.scoreCell}>{riskScoreDisplay}</td>
                      <td>
                        <span className={`${styles.riskBadge} ${styles[riskLevel.toLowerCase()]}`}>
                          {riskLevel}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.decisionBadge} ${styles[decision.toLowerCase()]}`}>
                          {decision}
                        </span>
                      </td>
                      <td className={styles.timeCell}>{new Date(tx.created_at).toLocaleString()}</td>
                      <td className={styles.actionCell}>
                        <button className={styles.drillBtn} onClick={(e) => { e.stopPropagation(); setSelectedTxId(tx.id); }}>
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
            <h4>No Transactions Found</h4>
            <p>No transactions match your current query or filter parameters.</p>
          </div>
        )}
      </div>

      {/* Drill-down Modal Drawer */}
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
