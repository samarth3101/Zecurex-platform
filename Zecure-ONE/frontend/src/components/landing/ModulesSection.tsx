import styles from '@/styles/components/landing.module.scss';

export default function ModulesSection() {
  const modules = [
    {
      icon: '🔍',
      title: 'Fraud Detection',
      description: 'Advanced ML algorithms to identify fraudulent activities and suspicious behaviors in real-time.'
    },
    {
      icon: '📊',
      title: 'Threat Analysis',
      description: 'Comprehensive threat intelligence and analysis tools for security professionals.'
    },
    {
      icon: '🧠',
      title: 'Behavioral AI',
      description: 'Machine learning models that understand user behavior patterns and detect anomalies.'
    },
    {
      icon: '🔌',
      title: 'API Gateway',
      description: 'Secure API management with built-in threat detection and rate limiting capabilities.'
    },
    {
      icon: '📋',
      title: 'Audit Logs',
      description: 'Comprehensive logging and audit trail system for compliance and investigation purposes.'
    },
    {
      icon: '⚡',
      title: 'Real-time Alerts',
      description: 'Instant notifications and alerting system for immediate threat response.'
    }
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Security Modules</h2>
      <div className={styles.modulesGrid}>
        {modules.map((module, index) => (
          <div key={index} className={styles.moduleCard}>
            <div className={styles.moduleIcon}>{module.icon}</div>
            <h3 className={styles.moduleTitle}>{module.title}</h3>
            <p className={styles.moduleDescription}>{module.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
