'use client';

import styles from './EnterSection.module.scss';
import { useRouter } from 'next/navigation';

export default function EnterSection() {
  const router = useRouter();

  return (
    <section className={styles.section} aria-label="Enter Zecure">
      {/* ── Background layers ── */}
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={styles.radialGlow} aria-hidden="true" />

      {/* ── Content ── */}
      <div className={styles.inner}>
        
        {/* EXACTLY 6 GRID CELLS (384px) TALL */}
        <div className={styles.textGroup}>
          <span className={styles.eyebrow}>ENTER ZECURE</span>
          <h2 className={styles.headline}>See what Zecure sees.</h2>
          <p className={styles.subtext}>
            From live payment signals to risk assessments and AI investigations —<br />
            enter the Zecure control room.
          </p>
        </div>

        {/* EXACTLY 1 GRID CELL (64px) TALL */}
        <button
          className={styles.ctaBtn}
          onClick={() => router.push('/dashboard/login')}
        >
          <span>Enter Zecure</span>
          <span className={styles.arrow} aria-hidden="true">→</span>
          <div className={styles.btnPulse} />
        </button>

        {/* EXACTLY 1 GRID CELL (64px) TALL */}
        <div className={styles.tagStrip}>
          <span className={styles.tag}>Risk Engine</span>
          <span className={styles.tagDot}>·</span>
          <span className={styles.tag}>AI Investigation</span>
          <span className={styles.tagDot}>·</span>
          <span className={styles.tag}>Audit Trail</span>
        </div>

      </div>
    </section>
  );
}
