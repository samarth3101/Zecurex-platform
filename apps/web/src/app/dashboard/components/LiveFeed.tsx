'use client';

import React, { useState } from 'react';
import { RefreshCw, Search, ArrowUpRight, Globe, CreditCard, ShieldAlert } from 'lucide-react';
import { TransactionRecord } from '@/lib/api';
import styles from './LiveFeed.module.scss';

interface LiveFeedProps {
  transactions: TransactionRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function LiveFeed({
  transactions,
  selectedId,
  onSelect,
  isLoading = false,
  onRefresh
}: LiveFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  // Filter transactions
  const filtered = transactions.filter(tx => {
    if (filterRisk !== 'ALL' && tx.risk_level !== filterRisk) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = tx.id?.toLowerCase().includes(q);
      const payIdMatch = tx.razorpay_payment_id?.toLowerCase().includes(q);
      const custMatch = tx.customer_id?.toLowerCase().includes(q);
      const methodMatch = tx.method?.toLowerCase().includes(q);
      if (!idMatch && !payIdMatch && !custMatch && !methodMatch) return false;
    }
    return true;
  });

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diffSec < 5) return 'just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      return new Date(dateStr).toLocaleTimeString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={styles.feedCard}>
      {/* Header */}
      <div className={styles.feedHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span className={styles.liveText}>LIVE PAYMENT INTELLIGENCE</span>
          </div>
          <span className={styles.subtext}>Monitoring 46 behavioral risk signals per transaction</span>
        </div>

        <div className={styles.headerRight}>
          {onRefresh && (
            <button className={styles.refreshBtn} onClick={onRefresh} disabled={isLoading} title="Refresh Feed">
              <RefreshCw size={13} className={isLoading ? styles.spin : ''} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={13} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search txn ID, customer, method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.riskFilters}>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
            <button
              key={level}
              type="button"
              className={`${styles.filterPill} ${filterRisk === level ? styles.active : ''} ${styles[level.toLowerCase()]}`}
              onClick={() => setFilterRisk(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table / List */}
      <div className={styles.tableWrapper}>
        {isLoading && transactions.length === 0 ? (
          <div className={styles.skeletonFeed}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={styles.skeletonRow} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className={styles.transactionList}>
            {filtered.map(tx => {
              const isSelected = selectedId === tx.id;
              const riskLevel = tx.risk_level || 'LOW';
              const riskScoreDisplay = tx.risk_score !== null && tx.risk_score !== undefined
                ? `${(tx.risk_score * 100).toFixed(0)}%`
                : '--';

              const isReview = (tx.risk_score && tx.risk_score >= 0.45) || riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
              const decision = isReview ? 'REVIEW' : 'ALLOW';

              return (
                <div
                  key={tx.id}
                  className={`${styles.txRow} ${isSelected ? styles.selected : ''} ${styles[`risk_${riskLevel.toLowerCase()}`]}`}
                  onClick={() => onSelect(tx.id)}
                >
                  <div className={styles.colId}>
                    <span className={styles.txIdText}>
                      {(tx.razorpay_payment_id || tx.id).substring(0, 14)}
                    </span>
                    <span className={styles.customerMeta}>
                      {tx.customer_id ? tx.customer_id.substring(0, 12) : 'cust_anon'}
                    </span>
                  </div>

                  <div className={styles.colAmount}>
                    <span className={styles.amountText}>₹{tx.amount.toLocaleString()}</span>
                    <div className={styles.methodTag}>
                      <CreditCard size={10} />
                      <span>{tx.method?.toUpperCase()}</span>
                      {tx.international && <span title="International Transaction"><Globe size={10} /></span>}
                    </div>
                  </div>

                  <div className={styles.colRisk}>
                    <div className={styles.riskScorePill}>
                      <span className={styles.scoreNum}>{riskScoreDisplay}</span>
                      <span className={`${styles.riskLevelTag} ${styles[riskLevel.toLowerCase()]}`}>
                        {riskLevel}
                      </span>
                    </div>
                  </div>

                  <div className={styles.colDecision}>
                    <span className={`${styles.decisionPill} ${styles[decision.toLowerCase()]}`}>
                      {decision}
                    </span>
                    <span className={styles.timeAgo}>{formatRelativeTime(tx.created_at)}</span>
                  </div>

                  <div className={styles.colAction}>
                    <ArrowUpRight size={14} className={styles.drillIcon} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <ShieldAlert size={24} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>Waiting for payment activity...</p>
            <p className={styles.emptySub}>Simulate a transaction or submit a live payment to start telemetry analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
