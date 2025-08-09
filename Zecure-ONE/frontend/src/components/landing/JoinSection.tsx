import Button from '@/components/common/Button';
import styles from '@/styles/components/landing.module.scss';

export default function JoinSection() {
  return (
    <section className={styles.joinSection}>
      <div className={styles.section}>
        <h2 className={styles.joinTitle}>Join the Mission</h2>
        <p className={styles.joinSubtitle}>
          We're building the future of AI-driven security. Join our team of innovators and help protect the digital world.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button size="lg">Join Our Team</Button>
          <Button variant="secondary" size="lg">View on GitHub</Button>
        </div>
      </div>
    </section>
  );
}
