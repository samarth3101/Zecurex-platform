'use client';

import React, { useState, useEffect } from 'react';
import { X, Award, Play, CheckCircle2 } from 'lucide-react';
import styles from './JudgeHudModal.module.scss';

interface JudgeHudModalProps {
  onOpenSimulation: () => void;
}

export default function JudgeHudModal({ onOpenSimulation }: JudgeHudModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show only once when entered via judge access or if flag is present
    if (typeof window !== 'undefined') {
      const mode = localStorage.getItem('zecure_judge_view');
      const hasDismissed = sessionStorage.getItem('zecure_judge_dismissed');
      if (mode === 'true' && !hasDismissed) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('zecure_judge_dismissed', 'true');
    }
    setIsOpen(false);
  };

  const handleLaunchSimulation = () => {
    handleClose();
    onOpenSimulation();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdropOverlay} onClick={handleClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <Award size={16} color="#94a3b8" />
            <span className={styles.headerTitle}>Razorpay Buildathon — Evaluator Mode</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <div className={styles.trackTag}>Track 02 — AI Risk Manager</div>

          <p className={styles.introText}>
            You have accessed Zecure in <strong>Evaluator Mode</strong>. This provides immediate access to live risk scoring, 46 behavioral signals, and Gemini 2.5 Flash investigation queue.
          </p>

          <div className={styles.authorPill}>
            <span>Developed by <span className={styles.authorName}>Samarth Patil</span></span>
            <span className={styles.trackName}>@samarth3101</span>
          </div>

          <div className={styles.metricGrid}>
            <div className={styles.metricBox}>
              <span className={styles.metricLabel}>Recall on 15k Txns</span>
              <span className={styles.metricVal}>96.08%</span>
            </div>
            <div className={styles.metricBox}>
              <span className={styles.metricLabel}>Local ML Latency</span>
              <span className={styles.metricVal}>&lt;15ms</span>
            </div>
            <div className={styles.metricBox}>
              <span className={styles.metricLabel}>Behavioral Signals</span>
              <span className={styles.metricVal}>46 Features</span>
            </div>
            <div className={styles.metricBox}>
              <span className={styles.metricLabel}>AI Verifier</span>
              <span className={styles.metricVal}>Gemini 2.5 Flash</span>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button
              className={styles.simActionBtn}
              onClick={handleLaunchSimulation}
            >
              <Play size={13} fill="#090d16" />
              <span>Launch Live Simulator</span>
            </button>
            <button
              className={styles.dismissBtn}
              onClick={handleClose}
            >
              Enter Control Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
