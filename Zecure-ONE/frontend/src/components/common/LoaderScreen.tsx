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

  const loadingSteps = [
    { progress: 15, text: 'Initializing systems...' },
    { progress: 30, text: 'Loading neural networks...' },
    { progress: 50, text: 'Establishing protocols...' },
    { progress: 70, text: 'Optimizing algorithms...' },
    { progress: 85, text: 'Finalizing setup...' },
    { progress: 100, text: 'Welcome to Zecure ONE' }
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        setProgress(step.progress);
        setLoadingText(step.text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnimatingOut(true);
          onLoadingComplete();
        }, 800);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className={`${styles.loaderScreen} ${isAnimatingOut ? styles.slideUp : ''}`}>
      <div className={styles.loaderContent}>
        <div className={styles.logo}>
          <h1 className={styles.logoText}>
            <span className={styles.zecure}>Zecure</span>
            <span className={styles.one}>ONE</span>
          </h1>
        </div>
        
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
          </div>
          <p className={styles.loadingText}>{loadingText}</p>
          <div className={styles.progressPercent}>{progress}%</div>
        </div>
      </div>
    </div>
  );
}
