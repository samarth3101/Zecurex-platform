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
  const [particleIntensity, setParticleIntensity] = useState(0);

  const shapes = [
    'liquidSquare', 
    'flowingCircle', 
    'morphingTriangle', 
    'crystalDiamond', 
    'energyHexagon',
    'plasmaStar',
    'quantumSphere'
  ];

  const loadingSteps = [
    { progress: 15, text: 'Initializing Quantum Core...', shape: 0, particles: 20 },
    { progress: 30, text: 'Loading Neural Networks...', shape: 1, particles: 40 },
    { progress: 45, text: 'Establishing Secure Protocols...', shape: 2, particles: 60 },
    { progress: 60, text: 'Calibrating AI Systems...', shape: 3, particles: 80 },
    { progress: 75, text: 'Optimizing Threat Detection...', shape: 4, particles: 100 },
    { progress: 90, text: 'Synchronizing Security Matrix...', shape: 5, particles: 120 },
    { progress: 100, text: 'Welcome to the Future', shape: 6, particles: 150 }
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        setProgress(step.progress);
        setLoadingText(step.text);
        setCurrentShape(step.shape);
        setParticleIntensity(step.particles);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnimatingOut(true);
          onLoadingComplete();
        }, 800);
      }
    }, 650);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className={`${styles.loaderScreen} ${isAnimatingOut ? styles.curtainUp : ''}`}>
      <div className={`${styles.curtainOverlay} ${isAnimatingOut ? styles.curtainSlideUp : ''}`}>
        <div className={styles.loaderContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              {/* Particle System */}
              <div className={styles.particleContainer}>
                {Array.from({ length: Math.floor(particleIntensity / 10) }, (_, i) => (
                  <div
                    key={i}
                    className={styles.particle}
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
              
              {/* Energy Field */}
              <div className={styles.energyField}>
                <div className={styles.energyRing}></div>
                <div className={styles.energyRing}></div>
                <div className={styles.energyRing}></div>
              </div>
              
              {/* Main Morphing Shape */}
              <div className={`${styles.morphingShape} ${styles[shapes[currentShape]]}`}>
                <div className={styles.shapeCore}></div>
                <div className={styles.shapeLayer1}></div>
                <div className={styles.shapeLayer2}></div>
                <div className={styles.shapeLayer3}></div>
                <div className={styles.liquidOverlay}></div>
                <div className={styles.glowEffect}></div>
              </div>
              
              {/* Holographic Grid */}
              <div className={styles.holographicGrid}>
                <div className={styles.gridLine}></div>
                <div className={styles.gridLine}></div>
                <div className={styles.gridLine}></div>
                <div className={styles.gridLine}></div>
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
              <div className={styles.progressGlow}></div>
            </div>
            <p className={styles.loadingText}>{loadingText}</p>
            <div className={styles.systemStatus}>
              <div className={styles.statusIndicator}></div>
              <span>System Status: Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
