'use client';
import { useState, useEffect, useRef } from 'react';
import Button from '@/components/common/Button';
import styles from '@/styles/components/Join.module.scss';

export default function JoinSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className={styles.joinSection}
    >
      <div className={styles.container}>
        
        {/* Main Content */}
        <div className={`${styles.joinContent} ${isVisible ? styles.visible : ''}`}>
          
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.badge}>
              <div className={styles.badgeIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              Join the Mission
            </div>

            <h2 className={styles.title}>
              Build the Future of <span className={styles.titleAccent}>Security</span>
            </h2>

            <p className={styles.subtitle}>
              We're building the future of AI-driven security. Join our elite team of innovators
              <br />and help protect the digital world from emerging cyber threats.
            </p>
          </header>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <Button size="lg" className={styles.primaryButton}>
              <span className={styles.buttonIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              Join Our Team
            </Button>

            <Button variant="secondary" size="lg" className={styles.secondaryButton}>
              <span className={styles.buttonIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              </span>
              View on GitHub
            </Button>
          </div>

          {/* Info Cards */}
          <div className={styles.infoCards}>
            {[
              { number: '50+', label: 'Elite Engineers', color: '#66b3cc', icon: 'team' },
              { number: '100K+', label: 'GitHub Stars', color: '#66a388', icon: 'star' },
              { number: '24/7', label: 'Innovation Hub', color: '#cc9966', icon: 'clock' }
            ].map((card, index) => (
              <div key={index} className={styles.infoCard}>
                <div className={styles.cardIcon} style={{ color: card.color }}>
                  {card.icon === 'team' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  )}
                  {card.icon === 'star' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  )}
                  {card.icon === 'clock' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  )}
                </div>
                
                <div className={styles.cardContent}>
                  <div className={styles.cardNumber}>{card.number}</div>
                  <div className={styles.cardLabel}>{card.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
