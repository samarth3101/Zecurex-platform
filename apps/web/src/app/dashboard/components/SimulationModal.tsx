'use client';

import React, { useState } from 'react';
import { X, Play, CheckCircle2, Loader2, Sparkles, ShieldAlert, Cpu } from 'lucide-react';
import { ZecureAPI, SimulatePaymentPayload } from '@/lib/api';
import styles from './SimulationModal.module.scss';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulationComplete: (transactionId: string) => void;
}

interface Preset {
  name: string;
  badge: string;
  description: string;
  payload: SimulatePaymentPayload;
}

const PRESETS: Preset[] = [
  {
    name: 'Normal Payment',
    badge: 'EXPECT: ALLOW',
    description: 'Domestic standard UPI payment conforming to customer baseline history.',
    payload: {
      razorpay_payment_id: '',
      amount: 1450,
      currency: 'INR',
      status: 'authorized',
      method: 'upi',
      customer_id: 'cust_retail_01',
      merchant_id: 'merch_swiggy_ind',
      device_id: 'dev_iphone14_mum',
      ip_hash: '103.21.14.88',
      geo_region: 'IN-MH',
      international: false
    }
  },
  {
    name: 'Velocity Attack',
    badge: 'EXPECT: REVIEW',
    description: 'Rapid payment burst (8th transaction within 15 minutes) triggering velocity alerts.',
    payload: {
      razorpay_payment_id: '',
      amount: 12000,
      currency: 'INR',
      status: 'authorized',
      method: 'card',
      customer_id: 'cust_velocity_target',
      merchant_id: 'merch_crypto_p2p',
      device_id: 'dev_emulator_x86',
      ip_hash: '185.220.101.5',
      geo_region: 'IN-DL',
      international: false
    }
  },
  {
    name: 'Amount Anomaly',
    badge: 'EXPECT: REVIEW',
    description: 'Transaction amount is 8.5x the customer’s 7-day average baseline.',
    payload: {
      razorpay_payment_id: '',
      amount: 88500,
      currency: 'INR',
      status: 'authorized',
      method: 'card',
      customer_id: 'cust_regular_lowval',
      merchant_id: 'merch_luxury_jewels',
      device_id: 'dev_unknown_mac',
      ip_hash: '49.36.120.4',
      geo_region: 'IN-KA',
      international: false
    }
  },
  {
    name: 'Payment Method Switch',
    badge: 'EXPECT: REVIEW',
    description: 'Customer switching from 100% UPI habit to high-value international card.',
    payload: {
      razorpay_payment_id: '',
      amount: 45000,
      currency: 'INR',
      status: 'authorized',
      method: 'card',
      customer_id: 'cust_upi_only_user',
      merchant_id: 'merch_electronics_hub',
      device_id: 'dev_new_browser',
      ip_hash: '152.58.18.22',
      geo_region: 'IN-TN',
      international: true
    }
  },
  {
    name: 'International Anomaly',
    badge: 'EXPECT: REVIEW',
    description: 'Foreign card with high velocity and new IP hash.',
    payload: {
      razorpay_payment_id: '',
      amount: 95000,
      currency: 'INR',
      status: 'authorized',
      method: 'card',
      customer_id: 'cust_international_09',
      merchant_id: 'merch_global_remit',
      device_id: 'dev_vpn_client',
      ip_hash: '194.26.29.112',
      geo_region: 'US-CA',
      international: true
    }
  }
];

export default function SimulationModal({ isOpen, onClose, onSimulationComplete }: SimulationModalProps) {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [formData, setFormData] = useState<SimulatePaymentPayload>({
    ...PRESETS[0].payload
  });

  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState<number>(0); // 0: ready, 1: payment received, 2: features computed, 3: risk assessed, 4: investigation, 5: complete
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    setFormData({
      ...PRESETS[idx].payload
    });
    setError(null);
    setStage(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);
    setError(null);
    setStage(1);

    // Generate fresh synthetic payment ID
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const payloadToSend: SimulatePaymentPayload = {
      ...formData,
      razorpay_payment_id: formData.razorpay_payment_id || `pay_${randomSuffix}`
    };

    try {
      // Simulate stepped feedback for the pipeline stages
      setTimeout(() => setStage(2), 300);
      setTimeout(() => setStage(3), 650);

      const assessment = await ZecureAPI.simulatePayment(payloadToSend);

      if (assessment.decision === 'REVIEW') {
        setStage(4);
      }

      setTimeout(() => {
        setStage(5);
        setIsRunning(false);
        onSimulationComplete(assessment.transaction_id);
        onClose();
      }, assessment.decision === 'REVIEW' ? 1200 : 700);

    } catch (err: unknown) {
      setIsRunning(false);
      setStage(0);
      setError(err instanceof Error ? err.message : 'Simulation failed');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.titleRow}>
              <Play size={16} className={styles.playIcon} />
              <h3>SIMULATE PAYMENT</h3>
            </div>
            <p className={styles.subtitle}>
              Run a synthetic payment through the complete Zecure intelligence pipeline.
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} disabled={isRunning}>
            <X size={18} />
          </button>
        </div>

        {/* Presets Grid */}
        <div className={styles.presetsSection}>
          <span className={styles.sectionLabel}>SELECT TRANSACTION PRESET</span>
          <div className={styles.presetsGrid}>
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.presetBtn} ${selectedPresetIdx === idx ? styles.active : ''}`}
                onClick={() => handleSelectPreset(idx)}
                disabled={isRunning}
              >
                <div className={styles.presetTop}>
                  <span className={styles.presetName}>{preset.name}</span>
                  <span className={`${styles.presetBadge} ${preset.badge.includes('ALLOW') ? styles.allow : styles.review}`}>
                    {preset.badge}
                  </span>
                </div>
                <p className={styles.presetDesc}>{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <span className={styles.sectionLabel}>TRANSACTION PARAMETERS</span>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Amount (₹)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                disabled={isRunning}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Payment Method</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                disabled={isRunning}
              >
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Net Banking</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Customer ID</label>
              <input
                type="text"
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                disabled={isRunning}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Merchant ID</label>
              <input
                type="text"
                value={formData.merchant_id}
                onChange={(e) => setFormData({ ...formData, merchant_id: e.target.value })}
                disabled={isRunning}
                required
              />
            </div>

            <div className={styles.field}>
              <label>IP / Network Hash</label>
              <input
                type="text"
                value={formData.ip_hash || ''}
                onChange={(e) => setFormData({ ...formData, ip_hash: e.target.value })}
                disabled={isRunning}
              />
            </div>

            <div className={styles.field}>
              <label>Geo Region</label>
              <input
                type="text"
                value={formData.geo_region || ''}
                onChange={(e) => setFormData({ ...formData, geo_region: e.target.value })}
                disabled={isRunning}
              />
            </div>
          </div>

          {/* Staged Execution Status */}
          {isRunning && (
            <div className={styles.pipelineProgress}>
              <span className={styles.progressLabel}>PIPELINE EXECUTION STATE</span>
              <div className={styles.stagesTrack}>
                <div className={`${styles.trackNode} ${stage >= 1 ? styles.done : ''}`}>
                  {stage > 1 ? <CheckCircle2 size={13} /> : <Loader2 size={13} className={styles.spin} />}
                  <span>Payment Ingested</span>
                </div>
                <div className={`${styles.trackNode} ${stage >= 2 ? styles.done : stage === 2 ? styles.current : ''}`}>
                  {stage > 2 ? <CheckCircle2 size={13} /> : stage === 2 ? <Loader2 size={13} className={styles.spin} /> : <Cpu size={13} />}
                  <span>46 Features Evaluated</span>
                </div>
                <div className={`${styles.trackNode} ${stage >= 3 ? styles.done : stage === 3 ? styles.current : ''}`}>
                  {stage > 3 ? <CheckCircle2 size={13} /> : stage === 3 ? <Loader2 size={13} className={styles.spin} /> : <ShieldAlert size={13} />}
                  <span>ML Risk Probabilities</span>
                </div>
                <div className={`${styles.trackNode} ${stage >= 4 ? styles.done : stage === 4 ? styles.current : ''}`}>
                  {stage >= 5 ? <CheckCircle2 size={13} /> : stage === 4 ? <Loader2 size={13} className={styles.spin} /> : <Sparkles size={13} />}
                  <span>AI Investigation Agent</span>
                </div>
              </div>
            </div>
          )}

          {error && <div className={styles.errorBanner}>{error}</div>}

          {/* Footer Actions */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isRunning}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isRunning}>
              {isRunning ? (
                <>
                  <Loader2 size={14} className={styles.spin} />
                  <span>Processing Pipeline...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Run Risk Assessment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
