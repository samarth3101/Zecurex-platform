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
    { progress: 15, text: 'Initializing modules...' },
    { progress: 40, text: 'Setting up environment...' },
    { progress: 70, text: 'Final touches...' },
    { progress: 100, text: 'Welcome to Zecure ONE!' }
  ];

  // Lock all scroll while loader present
  useEffect(() => {
    const html = document.documentElement;
    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      html.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < loadingSteps.length) {
        setProgress(loadingSteps[i].progress);
        setLoadingText(loadingSteps[i].text);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnimatingOut(true);
          setTimeout(() => {
            if (onLoadingComplete) onLoadingComplete();
          }, 750); // allow animation to finish
        }, 480);
      }
    }, 690);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className={`${styles.loaderScreen} ${isAnimatingOut ? styles.slideUp : ''}`}>
      <div className={styles.loaderContent}>
        <h1 className={styles.logoText}>
          <span className={styles.zecure}>Zecure</span>
          <span className={styles.one}>ONE</span>
        </h1>
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={styles.progressPercent}>{progress}%</span>
          <p className={styles.loadingText}>{loadingText}</p>
        </div>
      </div>
    </div>
  );
}
