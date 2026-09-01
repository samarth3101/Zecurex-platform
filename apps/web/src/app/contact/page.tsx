import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import styles from './contact.module.scss';

export const metadata = {
  title: 'Contact — Zecure ONE',
  description: 'Contact information for Samarth Patil.',
};

export default function ContactPage() {
  const contacts = [
    {
      label: 'Email',
      value: 'samarth.patil3101@gmail.com',
      href: 'mailto:samarth.patil3101@gmail.com',
    },
    {
      label: 'Portfolio',
      value: 'samarthppatil.netlify.app',
      href: 'https://samarthppatil.netlify.app/',
    },
    {
      label: 'GitHub',
      value: 'github.com/samarth3101',
      href: 'https://github.com/samarth3101',
    },
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
        <h1 className={styles.title}>Contact</h1>
        <p className={styles.subtitle}>
          Get in touch with the developer behind Zecure ONE.
        </p>

        <div className={styles.linksList}>
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={styles.linkRow}
            >
              <div className={styles.linkLeft}>
                <span className={styles.linkLabel}>{c.label}</span>
                <span className={styles.linkValue}>{c.value}</span>
              </div>
              <ExternalLink size={16} className={styles.linkIcon} />
            </a>
          ))}
        </div>

        <div className={styles.aboutSection}>
          <h3>About the Project</h3>
          <p>
            Zecure ONE is an AI-native payment risk intelligence platform developed by <strong>Samarth Patil</strong>. It features behavioral anomaly detection, real-time ML risk scoring, deterministic policy guardrails, and grounded AI investigation.
          </p>
        </div>
      </main>
    </div>
  );
}
