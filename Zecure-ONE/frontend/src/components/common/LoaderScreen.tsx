'use client';

import { useEffect, useState } from 'react';
import styles from './LoaderScreen.module.scss';

interface LoaderScreenProps {
  onLoadingComplete: () => void;
}

export default function LoaderScreen({ onLoadingComplete }: LoaderScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing Zecure ONE...');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    const loadingSteps = [
      { progress: 20, text: 'Loading AI Security Modules...' },
      { progress: 40, text: 'Establishing Secure Connection...' },
      { progress: 60, text: 'Initializing Threat Detection...' },
      { progress: 80, text: 'Preparing Dashboard...' },
      { progress: 100, text: 'Welcome to Zecure ONE' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setProgress(loadingSteps[currentStep].progress);
        setLoadingText(loadingSteps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        // Start curtain animation after a brief pause
        setTimeout(() => {
          setIsAnimatingOut(true);
          // Call onLoadingComplete after curtain animation completes
          setTimeout(() => {
            onLoadingComplete();
          }, 1500); // 1.5s for curtain animation
        }, 800);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className={`${styles.loaderScreen} ${isAnimatingOut ? styles.curtainUp : ''}`}>
      <div className={styles.loaderContent}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <div className={styles.shield}>
              <div className={styles.shieldInner}></div>
            </div>
          </div>
          <h1 className={styles.logoText}>ZECURE ONE</h1>
        </div>
        
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className={styles.loadingText}>{loadingText}</p>
        </div>
      </div>
    </div>
  );
}
