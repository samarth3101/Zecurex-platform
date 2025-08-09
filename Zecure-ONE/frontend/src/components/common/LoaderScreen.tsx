'use client';

import { useEffect, useState } from 'react';
import styles from './LoaderScreen.module.scss';

interface LoaderScreenProps {
  onLoadingComplete: () => void;
}

export default function LoaderScreen({ onLoadingComplete }: LoaderScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing Zecure ONE...');
  const [shapeStates, setShapeStates] = useState([0, 1, 2]); // [square=0, triangle=1, circle=2]
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // More immersive sequencing - smoother wave-like transitions
  const loadingSteps = [
    { progress: 12, text: 'Initializing quantum core...', states: [0, 1, 2] }, // square, triangle, circle
    { progress: 24, text: 'Loading neural pathways...', states: [2, 0, 1] }, // circle, square, triangle
    { progress: 36, text: 'Establishing secure protocols...', states: [1, 2, 0] }, // triangle, circle, square
    { progress: 48, text: 'Calibrating AI matrices...', states: [0, 1, 2] }, // square, triangle, circle
    { progress: 60, text: 'Synchronizing data streams...', states: [2, 0, 1] }, // circle, square, triangle
    { progress: 72, text: 'Optimizing security layers...', states: [1, 2, 0] }, // triangle, circle, square
    { progress: 84, text: 'Finalizing system integration...', states: [0, 2, 1] }, // square, circle, triangle
    { progress: 96, text: 'Activating Zecure ONE...', states: [1, 0, 2] }, // triangle, square, circle
    { progress: 100, text: 'System ready', states: [2, 1, 0] } // circle, triangle, square
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        setProgress(step.progress);
        setLoadingText(step.text);
        setShapeStates(step.states);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnimatingOut(true);
          onLoadingComplete();
        }, 1000);
      }
    }, 650); // Slightly faster for more fluid experience

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  const getShapeClass = (position: number, shapeType: number) => {
    const shapes = ['square', 'triangle', 'circle'];
    return `${styles.position}${position} ${styles[shapes[shapeType]]}`;
  };

  return (
    <div className={`${styles.loaderScreen} ${isAnimatingOut ? styles.curtainUp : ''}`}>
      <div className={`${styles.curtainOverlay} ${isAnimatingOut ? styles.curtainSlideUp : ''}`}>
        <div className={styles.loaderContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <div className={styles.shapesContainer}>
                {/* Position 0: Enhanced floating and morphing */}
                <div className={`${styles.shapePosition} ${getShapeClass(0, shapeStates[0])}`}>
                  <div className={styles.morphingShape}>
                    <div className={styles.liquidCore}></div>
                    <div className={styles.liquidFlow}></div>
                    <div className={styles.glowLayer}></div>
                  </div>
                </div>
                
                {/* Position 1: Enhanced floating and morphing */}
                <div className={`${styles.shapePosition} ${getShapeClass(1, shapeStates[1])}`}>
                  <div className={styles.morphingShape}>
                    <div className={styles.liquidCore}></div>
                    <div className={styles.liquidFlow}></div>
                    <div className={styles.glowLayer}></div>
                  </div>
                </div>
                
                {/* Position 2: Enhanced floating and morphing */}
                <div className={`${styles.shapePosition} ${getShapeClass(2, shapeStates[2])}`}>
                  <div className={styles.morphingShape}>
                    <div className={styles.liquidCore}></div>
                    <div className={styles.liquidFlow}></div>
                    <div className={styles.glowLayer}></div>
                  </div>
                </div>
              </div>
            </div>
            <h1 className={styles.logoText}>
              <span className={styles.zecure}>Zecure</span>
              <span className={styles.one}>ONE</span>
            </h1>
          </div>
          
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              ></div>
              <div className={styles.progressGlow}></div>
            </div>
            <p className={styles.loadingText}>{loadingText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
