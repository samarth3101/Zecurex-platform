import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './docs.module.scss';

export const metadata = {
  title: 'Documentation — Zecure ONE',
  description: 'Zecure Architecture, Core Components, and Technology Stack.',
};

export default function DocsPage() {
  const components = [
    {
      title: 'Behavioral Risk Engine',
      desc: 'Analyzes 46 point-in-time behavioral features surrounding a transaction.',
    },
    {
      title: 'ML Risk Engine',
      desc: 'Uses a Random Forest model to produce a calibrated risk score.',
    },
    {
      title: 'Deterministic Policy Engine',
      desc: 'Converts model risk into an operational decision such as ALLOW or REVIEW.',
    },
    {
      title: 'AI Investigation Agent',
      desc: 'Investigates transactions requiring deeper analysis and produces structured, evidence-grounded findings.',
    },
    {
      title: 'Evidence Provenance',
      desc: 'Connects investigation findings back to the underlying behavioral and network evidence.',
    },
    {
      title: 'Audit Trail',
      desc: 'Records important system events and investigation lifecycle activity.',
    },
  ];

  const tech = [
    'Next.js / React',
    'FastAPI',
    'PostgreSQL',
    'SQLAlchemy',
    'Alembic',
    'Scikit-learn',
    'Gemini',
    'TypeScript',
    'Python',
  ];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.topBar}>
        <div className={styles.topBarContainer}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>

      <main className={styles.container}>
        <h1 className={styles.title}>Zecure Documentation</h1>
        <p className={styles.lead}>
          Zecure is an AI-native payment risk intelligence platform designed to detect suspicious payment behavior, investigate high-risk activity, and provide auditable risk intelligence.
        </p>

        {/* Architecture */}
        <section className={styles.section}>
          <h2>Architecture</h2>
          <div className={styles.flowText}>
            Payment → Behavioral Features → ML Risk Engine → Deterministic Policy → AI Investigation → Evidence → Audit Trail
          </div>
        </section>

        {/* Core Components */}
        <section className={styles.section}>
          <h2>Core Components</h2>
          <div className={styles.componentList}>
            {components.map((item) => (
              <div key={item.title} className={styles.componentItem}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology */}
        <section className={styles.section}>
          <h2>Technology</h2>
          <div className={styles.techList}>
            {tech.map((t) => (
              <span key={t} className={styles.techItem}>• {t}</span>
            ))}
          </div>
        </section>

        {/* Principle */}
        <section className={styles.section}>
          <div className={styles.principleBox}>
            <h3>Important Architecture Principle</h3>
            <p>
              <strong>AI investigates. Deterministic policy decides.</strong>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
