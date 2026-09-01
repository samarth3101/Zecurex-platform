import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from '../legal.module.scss';

export const metadata = {
  title: 'Terms of Service — Zecure ONE',
  description: 'Zecure ONE Terms of Service.',
};

export default function TermsOfServicePage() {
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
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.date}>Last Updated: September 1, 2026</p>

        <div className={styles.content}>
          <section>
            <h2>1. Acceptance</h2>
            <p>
              By accessing or using Zecure, you agree to these Terms of Service. If you do not agree with these terms, please do not use the service.
            </p>
          </section>

          <section>
            <h2>2. Purpose of Zecure</h2>
            <p>
              Zecure is an AI-native payment risk intelligence prototype developed for demonstration and evaluation purposes.
            </p>
            <p>
              The platform demonstrates behavioral risk analysis, machine-learning risk scoring, deterministic policy evaluation, AI-assisted investigation, evidence provenance, and auditability.
            </p>
          </section>

          <section>
            <h2>3. Not a Payment Processor</h2>
            <p>
              Zecure does not itself process, settle, authorize, or transfer funds.
            </p>
            <p>
              The prototype should not be used to make real financial decisions or to process real payment transactions.
            </p>
          </section>

          <section>
            <h2>4. Demonstration Data</h2>
            <p>
              Transactions and attack scenarios presented through the simulation functionality may be synthetic or generated specifically for demonstration purposes.
            </p>
            <p>
              Users must not submit sensitive real-world financial or personal information to the demonstration environment unless explicitly authorized.
            </p>
          </section>

          <section>
            <h2>5. Risk Decisions</h2>
            <p>
              Zecure’s risk scores, classifications, recommendations, and AI-generated investigations are provided for demonstration and analytical purposes.
            </p>
            <p>
              They should not be treated as financial, legal, compliance, credit, or security advice. The AI investigation system does not independently authorize payment transactions.
            </p>
          </section>

          <section>
            <h2>6. Availability</h2>
            <p>
              Zecure is provided on an “as is” and “as available” basis.
            </p>
            <p>
              Because this is a prototype, functionality may change, become temporarily unavailable, or contain defects. No guarantee is made regarding continuous availability, performance, accuracy, or suitability for production use.
            </p>
          </section>

          <section>
            <h2>7. User Responsibilities</h2>
            <p>Users agree not to:</p>
            <ul>
              <li>Attempt to compromise or disrupt the system</li>
              <li>Access unauthorized accounts or data</li>
              <li>Submit malicious payloads</li>
              <li>Attempt to bypass authentication or security controls</li>
              <li>Use Zecure for unlawful purposes</li>
              <li>Treat demonstration results as production financial decisions</li>
            </ul>
          </section>

          <section>
            <h2>8. Intellectual Property</h2>
            <p>
              The Zecure software, design, branding, documentation, and associated materials are owned by their respective creators unless otherwise stated.
            </p>
            <p>
              Third-party libraries, frameworks, models, and services remain subject to their respective licenses and terms.
            </p>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Zecure and its creators are not responsible for losses, damages, or decisions resulting from the use or misuse of the prototype or its outputs.
            </p>
          </section>

          <section>
            <h2>10. Changes</h2>
            <p>
              These Terms may be updated as the project evolves. Continued use of Zecure after an update constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>
              For questions regarding these Terms, please reach out through our <Link href="/contact">Contact Page</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
