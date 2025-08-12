'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './security-playground.module.scss';

interface Simulation {
    id: string;
    name: string;
    type: 'penetration_test' | 'vulnerability_scan' | 'phishing_simulation' | 'red_team_exercise';
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    duration: string;
    description: string;
    status: 'available' | 'running' | 'completed';
    results?: {
        score: number;
        vulnerabilities: number;
        recommendations: number;
    };
}

export default function SecurityPlayground() {
    const router = useRouter();
    const [simulations, setSimulations] = useState<Simulation[]>([]);
    const [activeSimulation, setActiveSimulation] = useState<Simulation | null>(null);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        // Check access permissions
        const masterMode = localStorage.getItem('zecure-master-mode') === 'true';
        if (!masterMode) {
            router.push('/dashboard');
            return;
        }
        setHasAccess(true);

        // Mock simulations data
        setSimulations([
            {
                id: 'SIM-001',
                name: 'Web Application Penetration Test',
                type: 'penetration_test',
                difficulty: 'intermediate',
                duration: '2-3 hours',
                description: 'Comprehensive security assessment of web applications including OWASP Top 10 vulnerabilities',
                status: 'available'
            },
            {
                id: 'SIM-002',
                name: 'Network Vulnerability Scan',
                type: 'vulnerability_scan',
                difficulty: 'beginner',
                duration: '30-45 minutes',
                description: 'Automated scanning of network infrastructure to identify security weaknesses',
                status: 'completed',
                results: {
                    score: 85,
                    vulnerabilities: 12,
                    recommendations: 8
                }
            },
            {
                id: 'SIM-003',
                name: 'Advanced Phishing Campaign',
                type: 'phishing_simulation',
                difficulty: 'advanced',
                duration: '1-2 weeks',
                description: 'Sophisticated social engineering simulation to test employee awareness',
                status: 'running'
            },
            {
                id: 'SIM-004',
                name: 'Red Team Attack Simulation',
                type: 'red_team_exercise',
                difficulty: 'expert',
                duration: '1-3 days',
                description: 'Full-scale adversarial simulation mimicking real-world attack scenarios',
                status: 'available'
            }
        ]);
    }, [router]);

    const startSimulation = (simulation: Simulation) => {
        setSimulations(prev => prev.map(sim => 
            sim.id === simulation.id ? { ...sim, status: 'running' as const } : sim
        ));
        setActiveSimulation({ ...simulation, status: 'running' });
    };

    const stopSimulation = () => {
        if (activeSimulation) {
            setSimulations(prev => prev.map(sim => 
                sim.id === activeSimulation.id ? { ...sim, status: 'available' as const } : sim
            ));
            setActiveSimulation(null);
        }
    };

    if (!hasAccess) {
        return null;
    }

    return (
        <div className={styles.playgroundPage}>
            <header className={styles.header}>
                <button className={styles.backButton} onClick={() => router.push('/dashboard')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Dashboard
                </button>
                <div className={styles.headerInfo}>
                    <h1>
                        Security Playground
                        <span className={styles.premiumBadge}>PREMIUM</span>
                    </h1>
                    <p>Interactive security testing and simulation environment</p>
                </div>
            </header>

            <div className={styles.playgroundStats}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>8</div>
                    <div className={styles.statLabel}>Active Simulations</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>24</div>
                    <div className={styles.statLabel}>Completed Tests</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>156</div>
                    <div className={styles.statLabel}>Vulnerabilities Found</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>92%</div>
                    <div className={styles.statLabel}>Security Score</div>
                </div>
            </div>

            <div className={styles.playgroundContent}>
                <div className={styles.simulationsList}>
                    <h3>Available Simulations</h3>
                    <div className={styles.simulationsGrid}>
                        {simulations.map(simulation => (
                            <div 
                                key={simulation.id} 
                                className={`${styles.simulationCard} ${styles[simulation.difficulty]} ${styles[simulation.status]}`}
                            >
                                <div className={styles.simulationHeader}>
                                    <h4>{simulation.name}</h4>
                                    <div className={styles.simulationBadges}>
                                        <span className={`${styles.difficultyBadge} ${styles[simulation.difficulty]}`}>
                                            {simulation.difficulty}
                                        </span>
                                        <span className={styles.typeBadge}>
                                            {simulation.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className={styles.simulationContent}>
                                    <p>{simulation.description}</p>
                                    <div className={styles.simulationMeta}>
                                        <span>⏱️ Duration: {simulation.duration}</span>
                                        <span className={`${styles.simulationStatus} ${styles[simulation.status]}`}>
                                            {simulation.status === 'running' ? '🔄 Running' : 
                                             simulation.status === 'completed' ? '✅ Completed' : '⚡ Available'}
                                        </span>
                                    </div>
                                </div>

                                {simulation.results && (
                                    <div className={styles.simulationResults}>
                                        <div className={styles.resultItem}>
                                            <span className={styles.resultLabel}>Score:</span>
                                            <span className={styles.resultValue}>{simulation.results.score}%</span>
                                        </div>
                                        <div className={styles.resultItem}>
                                            <span className={styles.resultLabel}>Vulnerabilities:</span>
                                            <span className={styles.resultValue}>{simulation.results.vulnerabilities}</span>
                                        </div>
                                        <div className={styles.resultItem}>
                                            <span className={styles.resultLabel}>Recommendations:</span>
                                            <span className={styles.resultValue}>{simulation.results.recommendations}</span>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.simulationActions}>
                                    {simulation.status === 'available' && (
                                        <button 
                                            className={styles.startBtn}
                                            onClick={() => startSimulation(simulation)}
                                        >
                                            Start Simulation
                                        </button>
                                    )}
                                    {simulation.status === 'running' && (
                                        <button 
                                            className={styles.stopBtn}
                                            onClick={stopSimulation}
                                        >
                                            Stop Simulation
                                        </button>
                                    )}
                                    {simulation.status === 'completed' && (
                                        <button className={styles.viewBtn}>
                                            View Report
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {activeSimulation && (
                    <div className={styles.activeSimulation}>
                        <h3>Active Simulation</h3>
                        <div className={styles.simulationMonitor}>
                            <div className={styles.monitorHeader}>
                                <h4>{activeSimulation.name}</h4>
                                <div className={styles.runningIndicator}>
                                    <div className={styles.pulse}></div>
                                    Running
                                </div>
                            </div>
                            <div className={styles.simulationProgress}>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill}></div>
                                </div>
                                <div className={styles.progressText}>
                                    Simulation in progress... Analyzing security posture
                                </div>
                            </div>
                            <div className={styles.liveMetrics}>
                                <div className={styles.metric}>
                                    <span className={styles.metricLabel}>Tests Run:</span>
                                    <span className={styles.metricValue}>47</span>
                                </div>
                                <div className={styles.metric}>
                                    <span className={styles.metricLabel}>Vulnerabilities:</span>
                                    <span className={styles.metricValue}>3</span>
                                </div>
                                <div className={styles.metric}>
                                    <span className={styles.metricLabel}>Time Elapsed:</span>
                                    <span className={styles.metricValue}>12m 34s</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
