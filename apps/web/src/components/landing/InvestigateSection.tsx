import styles from './InvestigateSection.module.scss';

export default function InvestigateSection() {

  return (
    <section className={styles.section} aria-label="AI Investigation">
      <div className={styles.bgGrid} aria-hidden="true" />

      <div className={styles.inner}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>AI INVESTIGATION</span>
          <h2 className={styles.headline}>
            Knowing<br />
            something is risky<br />
            isn&apos;t enough.<br />
            <span className={styles.headlineAccent}>Know why.</span>
          </h2>
          <p className={styles.body}>
            When Zecure detects unusual behavior,<br />
            its AI Investigation Agent examines the evidence,<br />
            compares it with historical context,<br />
            and explains why the transaction was flagged —<br />
            while keeping recommendations grounded, bounded, and auditable.
          </p>
        </div>

        {/* ── Investigation Visualization ── */}
        <div className={styles.imageWrapper}>
          <img
            src="/zecur.png"
            alt="Zecure AI Investigation flow"
            className={styles.investigateImage}
          />
        </div>

        {/* ── Key message ── */}
        <div className={styles.keyMessage}>
          <p className={styles.keyLine}>
            AI investigates.{' '}
            <span className={styles.keyAccent}>Deterministic policy decides.</span>
          </p>

          <div className={styles.pillars}>
            {[
              { label: 'GROUNDED',  sub: 'Evidence' },
              { label: 'BOUNDED',   sub: 'Recommendations' },
              { label: 'AUDITABLE', sub: 'Decisions' },
            ].map((p) => (
              <div key={p.label} className={styles.pillar}>
                <span className={styles.pillarLabel}>{p.label}</span>
                <span className={styles.pillarSub}>{p.sub}</span>
              </div>
            ))}
          </div>

          <p className={styles.credibility}>
            Every investigation is backed by point-in-time evidence and recorded
            in a tamper-evident audit trail.
          </p>
        </div>

      </div>
    </section>
  );
}
