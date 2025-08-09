'use client';

import { useEffect, useState } from 'react';
import styles from './LoaderScreen.module.scss';

interface LoaderScreenProps {
  onLoadingComplete: () => void;
}

export default function LoaderScreen({ onLoadingComplete }: LoaderScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing Zecure ONE...');
  const [currentShape, setCurrentShape] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const shapes = ['square', 'circle', 'triangle', 'diamond', 'hexagon'];

  useEffect(() => {
    const loadingSteps = [
      { progress: 20, text: 'Loading AI Security Modules...', shape: 0 },
      { progress: 40, text: 'Establishing Secure Connection...', shape: 1 },
      { progress: 60, text: 'Initializing Threat Detection...', shape: 2 },
      { progress: 80, text: 'Preparing Dashboard...', shape: 3 },
      { progress: 100, text: 'Welcome to Zecure ONE', shape: 4 }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setProgress(loadingSteps[currentStep].progress);
        setLoadingText(loadingSteps[currentStep].text);
        setCurrentShape(loadingSteps[currentStep].shape);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnimatingOut(true);
          setTimeout(() => {
            onLoadingComplete();
          }, 2000); // 2s for smooth curtain animation
        }, 1000);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className={`${styles.loaderScreen} ${isAnimatingOut ? styles.curtainUp : ''}`}>
      <div className={`${styles.curtainOverlay} ${isAnimatingOut ? styles.curtainSlideUp : ''}`}>
        <div className={styles.loaderContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <div className={`${styles.morphingShape} ${styles[shapes[currentShape]]}`}>
                <div className={styles.shapeInner}></div>
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
    </div>
  );
}
