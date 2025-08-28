'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Eye, DollarSign, Zap } from 'lucide-react';
import styles from '@/styles/components/ProblemSection.module.scss';

interface ProblemSectionProps {
  isVisible?: boolean;
}

export default function ProblemSection({ isVisible = true }: ProblemSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const problems = [
    {
      icon: <AlertTriangle size={16} />,
      title: "Evolving Threats",
      description: "Attackers adapt faster than legacy systems patch vulnerabilities.",
      stat: "2,200",
      statLabel: "ATTACKS/DAY",
      severity: "critical"
    },
    {
      icon: <Eye size={16} />,
      title: "Detection Blind Spots", 
      description: "Rule-based systems miss 76% of sophisticated attack patterns.",
      stat: "76%",
      statLabel: "UNDETECTED",
      severity: "high"
    },
    {
      icon: <DollarSign size={16} />,
      title: "Breach Impact",
      description: "Single breaches cost millions in damages and reputation loss.",
      stat: "$4.45M",
      statLabel: "AVERAGE COST",
      severity: "severe"
    },
    {
      icon: <Zap size={16} />,
      title: "Alert Fatigue",
      description: "Teams drown in 10,000+ daily alerts, missing real threats.",
      stat: "53%",
      statLabel: "WASTED EFFORT", 
      severity: "urgent"
    }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className={styles.problemSection}>
        <div className={styles.container}>
          <div className={styles.loadingWindow}>
            <div className={styles.loadingText}>Loading Security Analysis...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.problemSection}>
      <div className={styles.container}>
        <div className={styles.problemWindow}>
          
          {/* Window Header */}
          <div className={styles.windowHeader}>
            <div className={styles.windowControls}>
              <span className={styles.control}></span>
              <span className={styles.control}></span>
              <span className={styles.control}></span>
            </div>
            <div className={styles.windowTitle}>Security Analysis Report</div>
            <div className={styles.headerBadge}>
              <span className={styles.severity}>CRITICAL ISSUES DETECTED</span>
            </div>
          </div>

          {/* Window Content */}
          <div className={styles.windowContent}>
            
            {/* Header */}
            <div className={styles.reportHeader}>
              <h2 className={styles.mainHeading}>
                Security Status Quo is <span className={styles.broken}>Broken</span>
              </h2>
              <p className={styles.subtitle}>
                Cybercrime evolves faster than defenses—creating dangerous blind spots.
              </p>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
              
              {/* Left Panel */}
              <div className={styles.leftPanel}>
                <div className={styles.shieldSection}>
                  <div className={styles.brokenShield}>
                    <Shield size={50} />
                    <div className={styles.crack1}></div>
                    <div className={styles.crack2}></div>
                    <div className={styles.crack3}></div>
                  </div>
                  <div className={styles.shieldStatus}>DEFENSES COMPROMISED</div>
                </div>
                
                <div className={styles.comparison}>
                  <div className={styles.currentSec}>
                    <h4>Current Security</h4>
                    <div className={styles.traits}>
                      <span className={styles.bad}>Reactive</span>
                      <span className={styles.bad}>Slow</span>
                      <span className={styles.bad}>Expensive</span>
                    </div>
                  </div>
                  
                  <div className={styles.vsText}>VS</div>
                  
                  <div className={styles.neededSec}>
                    <h4>What's Needed</h4>
                    <div className={styles.traits}>
                      <span className={styles.good}>Adaptive</span>
                      <span className={styles.good}>Proactive</span>
                      <span className={styles.good}>AI-driven</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div className={styles.rightPanel}>
                <div className={styles.problemsGrid}>
                  {problems.map((problem, index) => (
                    <div 
                      key={index}
                      className={`${styles.problemCard} ${activeCard === index ? styles.active : ''}`}
                      onMouseEnter={() => setActiveCard(index)}
                      onMouseLeave={() => setActiveCard(null)}
                    >
                      <div className={styles.cardHeader}>
                        <div className={styles.cardIcon}>
                          {problem.icon}
                        </div>
                        <div className={styles.cardInfo}>
                          <h3>{problem.title}</h3>
                          <span className={`${styles.badge} ${styles[problem.severity]}`}>
                            {problem.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <p className={styles.cardText}>{problem.description}</p>
                      
                      <div className={styles.cardStats}>
                        <div className={styles.statNumber}>{problem.stat}</div>
                        <div className={styles.statLabel}>{problem.statLabel}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <p className={styles.evolutionText}>
                Threats evolve exponentially. <span className={styles.highlight}>Security must evolve faster.</span>
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
