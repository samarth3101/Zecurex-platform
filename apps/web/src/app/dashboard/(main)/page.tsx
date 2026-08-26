/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState, useEffect } from 'react';
import styles from './dashboard.module.scss';
import { ZecureAPI } from '@/lib/api';
import LiveFeed from '../components/LiveFeed';
import TransactionDetail from '../components/TransactionDetail';

export default function DashboardPage() {
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const mockPayload = {
        razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
        amount: Math.floor(Math.random() * 50000) + 1000,
        currency: 'INR',
        status: 'authorized',
        method: 'card',
        customer_id: 'cust_' + Math.random().toString(36).substr(2, 9),
        merchant_id: 'merch_demo123',
        ip_hash: '192.168.1.' + Math.floor(Math.random() * 255),
        international: Math.random() > 0.8
      };
      
      await ZecureAPI.simulatePayment(mockPayload);
    } catch (err: any) {
      console.error('Simulation failed:', err);
      alert('Simulation failed: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      <div className={styles.feedCol}>
        <div className={styles.feedHeader}>
          <h2>Live Transactions</h2>
          <button 
            className={styles.simulateBtn} 
            onClick={handleSimulate}
            disabled={isSimulating}
          >
            {isSimulating ? 'Simulating...' : 'Simulate Suspicious Payment'}
          </button>
        </div>
        <LiveFeed onSelect={(id) => setSelectedTxId(id)} selectedId={selectedTxId} />
      </div>
      
      <div className={styles.detailCol}>
        {selectedTxId ? (
          <TransactionDetail transactionId={selectedTxId} onClose={() => setSelectedTxId(null)} />
        ) : (
          <div className={styles.emptyDetail}>
            <p>Select a transaction from the feed to view its risk assessment and AI investigation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
