import styles from '@/styles/components/landing.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLinks}>
          <a href="#" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="#">Documentation</a>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
        <p className={styles.copyright}>
          © 2025 Zecure ONE.
        </p>
      </div>
    </footer>
  );
}
