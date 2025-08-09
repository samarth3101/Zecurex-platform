import styles from '@/styles/components/landing.module.scss';

export default function HowItWorksSection() {
  const steps = [
    {
      title: 'Monitor',
      description: 'Continuous monitoring of user activities and system interactions'
    },
    {
      title: 'Analyze',
      description: 'AI algorithms analyze patterns and detect anomalies in real-time'
    },
    {
      title: 'Detect',
      description: 'Identify potential threats and security vulnerabilities instantly'
    },
    {
      title: 'Protect',
      description: 'Automatically block threats and notify security teams'
    }
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>How It Works</h2>
      <div className={styles.workflowContainer}>
        <div className={styles.flowDiagram}>
          {steps.map((step, index) => (
            <div key={index} className={styles.flowStep}>
              <div className={styles.stepNumber}>{index + 1}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
