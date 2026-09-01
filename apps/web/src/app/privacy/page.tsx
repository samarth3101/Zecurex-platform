import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from '../legal.module.scss';

export const metadata = {
  title: 'Privacy Policy — Zecure ONE',
  description: 'Zecure ONE Privacy Policy.',
};

export default function PrivacyPolicyPage() {
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
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.date}>Last Updated: September 1, 2026</p>

        <div className={styles.content}>
          <section>
            <h2>1. Overview</h2>
            <p>
              Zecure (“Zecure”, “we”, “us”, or “our”) is a payment risk intelligence prototype developed for demonstration and evaluation purposes.
            </p>
            <p>
              This Privacy Policy explains how information may be collected, processed, and used when you interact with the Zecure website and dashboard.
            </p>
          </section>

          <section>
            <h2>2. Information We Process</h2>
            <p>Depending on how Zecure is used, the system may process information such as:</p>
            <ul>
              <li>Transaction identifiers</li>
              <li>Transaction amounts and currencies</li>
              <li>Payment methods</li>
              <li>Customer and merchant identifiers</li>
              <li>Timestamp information</li>
              <li>Geographic or regional information</li>
              <li>IP/network-related identifiers</li>
              <li>Device or behavioral signals</li>
              <li>Risk scores and risk classifications</li>
              <li>Investigation and audit information</li>
            </ul>
            <p>
              For the demonstration, transaction information may be synthetically generated or simulated and should not be interpreted as real customer financial data.
            </p>
          </section>

          <section>
            <h2>3. How Information Is Used</h2>
            <p>Information processed by Zecure is used to:</p>
            <ul>
              <li>Calculate behavioral risk signals</li>
              <li>Evaluate payment risk</li>
              <li>Generate risk classifications</li>
              <li>Trigger investigations when required</li>
              <li>Provide explanations and evidence for risk assessments</li>
              <li>Maintain an auditable system history</li>
              <li>Demonstrate the functionality of the Zecure platform</li>
            </ul>
          </section>

          <section>
            <h2>4. AI Processing</h2>
            <p>
              Zecure may use an AI investigation service to analyze risk-related evidence and generate structured investigation findings.
            </p>
            <p>
              The AI investigation layer is designed to provide explanations and bounded recommendations. It does not independently authorize, execute, or modify payment transactions.
            </p>
          </section>

          <section>
            <h2>5. Data Retention</h2>
            <p>
              Data used during demonstrations may be stored temporarily in the application’s database for testing, evaluation, debugging, and demonstration purposes.
            </p>
            <p>
              Zecure is not currently intended to serve as a production payment-processing or long-term financial-record storage system.
            </p>
          </section>

          <section>
            <h2>6. Third-Party Services</h2>
            <p>
              Zecure may use third-party infrastructure or AI services to provide parts of its functionality.
            </p>
            <p>
              Information sent to such services is limited to what is necessary for the corresponding functionality in the prototype environment.
            </p>
          </section>

          <section>
            <h2>7. Security</h2>
            <p>
              Reasonable technical measures are used to protect application data and credentials within the prototype environment.
            </p>
            <p>
              However, Zecure is a prototype and should not be considered a production financial system or a substitute for a formally audited security environment.
            </p>
          </section>

          <section>
            <h2>8. Children’s Privacy</h2>
            <p>Zecure is not intended for use by children.</p>
          </section>

          <section>
            <h2>9. Changes to This Policy</h2>
            <p>This Privacy Policy may be updated as the Zecure project evolves.</p>
          </section>

          <section>
            <h2>10. Contact</h2>
            <p>
              For questions regarding this Privacy Policy, please reach out through our <Link href="/contact">Contact Page</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
