'use client';

import styles from './BehaviorSection.module.scss';

export default function BehaviorSection() {
  return (
    <section className={styles.section} aria-label="Behavioral Risk Intelligence">
      <div className={styles.bgGrid} aria-hidden="true" />

      <div className={styles.inner}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>BEHAVIORAL RISK INTELLIGENCE</span>
          <h2 className={styles.headline}>A payment is only the beginning.</h2>
          <p className={styles.body}>
            Zecure analyzes the behavior surrounding every transaction —
            velocity, amount patterns, payment methods, geography, and network
            signals — to detect suspicious activity before it becomes loss.
          </p>
        </div>

        {/* ── Behavior Visualization Image ── */}
        <div className={styles.imageWrapper}>
          <img
            src="/behavior-viz.png"
            alt="Zecure Behavioral Risk Intelligence Engine Visualization"
            className={styles.behaviorImage}
          />
        </div>

        {/* ── Closing line ── */}
        <div className={styles.closing}>
          <p>Most payment systems see the transaction.</p>
          <p className={styles.closingAccent}>Zecure sees the behavior behind it.</p>
        </div>

      </div>
    </section>
  );
}
