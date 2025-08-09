import styles from '@/styles/components/landing.module.scss';

export default function AboutSection() {
  const features = [
    {
      icon: '🔍',
      title: 'Real-time Fraud Detection',
      description: 'AI-powered monitoring that identifies threats before they impact your systems.'
    },
    {
      icon: '🤖',
      title: 'AI-driven Cybersecurity',
      description: 'Advanced machine learning algorithms that adapt and evolve with emerging threats.'
    },
    {
      icon: '📊',
      title: 'Smart Incident Reporting',
      description: 'Intelligent analysis and automated reporting of security incidents and patterns.'
    }
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>What is Zecure ONE?</h2>
      <div className={styles.aboutGrid}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <div className={styles.icon}>{feature.icon}</div>
            <h3 className={styles.title}>{feature.title}</h3>
            <p className={styles.description}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
