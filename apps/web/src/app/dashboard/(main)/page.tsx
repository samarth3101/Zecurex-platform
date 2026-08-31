'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ZecureAPI, TransactionRecord } from '@/lib/api';
import RiskPulse from '../components/RiskPulse';
import LiveFeed from '../components/LiveFeed';
import TransactionDetail from '../components/TransactionDetail';
import styles from './dashboard.module.scss';

export default function DashboardOverviewPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [investigationCount, setInvestigationCount] = useState<number>(0);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [txList, invList] = await Promise.all([
        ZecureAPI.getTransactions(50).catch(() => []),
        ZecureAPI.getInvestigations(50).catch(() => [])
      ]);

      setTransactions(txList);
      setInvestigationCount(invList.length);

      // Auto-select first transaction if none selected and data exists
      if (txList.length > 0 && !selectedTxId) {
        setSelectedTxId(txList[0].id);
      }
    } catch (err) {
      console.error('Error fetching dashboard feed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTxId]);

  // Initial fetch and 5-second live polling
  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Listen for simulation completed event to immediately refresh and select new transaction
  useEffect(() => {
    const handleSimulationCreated = (e: CustomEvent<{ transactionId: string }>) => {
      fetchDashboardData().then(() => {
        if (e.detail?.transactionId) {
          setSelectedTxId(e.detail.transactionId);
        }
      });
    };

    window.addEventListener('zecure:simulation_created' as unknown as keyof WindowEventMap, handleSimulationCreated as EventListener);
    return () => {
      window.removeEventListener('zecure:simulation_created' as unknown as keyof WindowEventMap, handleSimulationCreated as EventListener);
    };
  }, [fetchDashboardData]);

  return (
    <div className={styles.overviewContainer}>
      {/* Hero Welcome & Subtitle */}
      <div className={styles.heroSection}>
        <div className={styles.heroText}>
          <h2 className={styles.heroHeading}>Risk intelligence, at a glance.</h2>
          <p className={styles.heroSub}>
            Monitor payment behavior, investigate anomalies, and review AI-grounded risk decisions.
          </p>
        </div>
      </div>

      {/* Risk Pulse Telemetry */}
      <RiskPulse transactions={transactions} investigationCount={investigationCount} />

      {/* Live Workspace Grid */}
      <div className={styles.workspaceGrid}>
        {/* Left Column: Live Feed */}
        <div className={styles.feedCol}>
          <LiveFeed
            transactions={transactions}
            selectedId={selectedTxId}
            onSelect={(id) => setSelectedTxId(id)}
            isLoading={isLoading}
            onRefresh={fetchDashboardData}
          />
        </div>

        {/* Right Column: Transaction Intelligence Workspace */}
        <div className={styles.detailCol}>
          {selectedTxId ? (
            <TransactionDetail
              transactionId={selectedTxId}
              onClose={() => setSelectedTxId(null)}
            />
          ) : (
            <div className={styles.emptyDetail}>
              <div className={styles.emptyCard}>
                <span className={styles.emptyPulse} />
                <h4>No Transaction Selected</h4>
                <p>Select any transaction from the live payment feed on the left to inspect its 46 behavioral risk features and grounded AI investigation.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
