'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ai-agent.module.scss';

interface Threat {
    id: string;
    type: string;
    count: number;
    color: string;
}

interface Investigation {
    id: string;
    type: string;
    risk: number;
    status: 'Investigating' | 'Mitigated' | 'Pending Review';
}

interface Recommendation {
    id: string;
    icon: string;
    text: string;
    accepted?: boolean;
}

interface Message {
    id: string;
    sender: 'user' | 'zpt';
    text: string;
    timestamp: string;
}

// Enhanced Progress Ring Component
function ProgressRing({ progress, size = 40, strokeWidth = 3, color = '#10b981' }: {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className={styles.progressRing} style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#f1f5f9"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    className={styles.progressCircle}
                />
            </svg>
            <span className={styles.progressText}>{progress}%</span>
        </div>
    );
}

export default function ZecureZPT() {
    const router = useRouter();
    const [userName] = useState('Samarth');
    const [currentTime, setCurrentTime] = useState('');
    const [systemStatus, setSystemStatus] = useState<'Secure' | 'Watch' | 'Alert'>('Secure');
    const [lastScan] = useState('5 minutes ago');

    // Chat ref for auto-scroll functionality (only need messages container)
    const chatMessagesRef = useRef<HTMLDivElement>(null);

    const [threats] = useState<Threat[]>([
        { id: '1', type: 'Malware', count: 12, color: '#ef4444' },
        { id: '2', type: 'Phishing', count: 5, color: '#f59e0b' },
        { id: '3', type: 'Intrusion', count: 7, color: '#10b981' }
    ]);

    const [investigations] = useState<Investigation[]>([
        { id: '1', type: 'Malware Detection', risk: 75, status: 'Investigating' },
        { id: '2', type: 'Phishing Campaign', risk: 42, status: 'Pending Review' },
        { id: '3', type: 'Network Intrusion', risk: 90, status: 'Mitigated' }
    ]);

    const [recommendations, setRecommendations] = useState<Recommendation[]>([
        { id: '1', icon: '🛡️', text: 'Enable MFA for 3 inactive accounts' },
        { id: '2', icon: '📜', text: 'Update firewall rule #12' },
        { id: '3', icon: '⚡', text: 'Block IP subnet 192.168.xx' }
    ]);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'zpt', text: 'Hello Samarth, I am ZPT. Your systems are secure and under active monitoring. How can I assist you today?', timestamp: '6:20 PM' }
    ]);

    const [input, setInput] = useState('');
    const [activeTab, setActiveTab] = useState<'ask' | 'alerts'>('ask');
    const [isTyping, setIsTyping] = useState(false);

    // Fixed auto-scroll function - only scrolls chat container
    const scrollToBottom = () => {
        if (chatMessagesRef.current) {
            const container = chatMessagesRef.current;
            container.scrollTop = container.scrollHeight;
        }
    };

    // Auto-scroll when messages change or typing indicator appears
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            scrollToBottom();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [messages, isTyping]);

    useEffect(() => {
        const masterMode = localStorage.getItem('zecure-master-mode') === 'true';
        if (!masterMode) {
            router.push('/');
            return;
        }

        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
            setCurrentTime(`${greeting}, ${userName}.`);
        };

        updateTime();
        const timeInterval = setInterval(updateTime, 60000);
        return () => clearInterval(timeInterval);
    }, [router, userName]);

    const handleRecommendationAction = (id: string, action: 'accept' | 'ignore') => {
        setRecommendations(prev => prev.map(rec =>
            rec.id === id ? { ...rec, accepted: action === 'accept' } : rec
        ));
    };

    const sendMessage = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Immediate scroll after user message
        setTimeout(() => scrollToBottom(), 50);

        setTimeout(() => {
            const responses = [
                'I\'m analyzing your security infrastructure. All systems appear to be functioning normally.',
                'Based on current threat intelligence, your security posture is strong. No immediate action required.',
                'I\'ve completed the requested analysis. Would you like me to provide more detailed insights?',
                'Security monitoring is active. I\'ll notify you immediately if any anomalies are detected.',
                'Running comprehensive threat assessment... No immediate risks detected.',
                'Your firewall configuration looks optimal. All ports are properly secured.',
                'I\'ve identified 3 potential security improvements. Would you like me to implement them?',
                'Real-time monitoring shows normal traffic patterns. No suspicious activity detected.'
            ];

            const zptMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'zpt',
                text: responses[Math.floor(Math.random() * responses.length)],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, zptMessage]);
            setIsTyping(false);

            // Scroll after ZPT response
            setTimeout(() => scrollToBottom(), 50);
        }, 2000);
    };

    const getStatusIndicator = () => {
        switch (systemStatus) {
            case 'Secure': return { icon: '●', color: '#10b981' };
            case 'Watch': return { icon: '●', color: '#f59e0b' };
            case 'Alert': return { icon: '●', color: '#ef4444' };
            default: return { icon: '●', color: '#10b981' };
        }
    };

    const statusIndicator = getStatusIndicator();

    return (
        <div className={styles.zptDashboard}>
            {/* Header */}
            <header className={styles.header}>
                <button
                    className={styles.backButton}
                    onClick={() => {
                        if (window.history.length > 1) {
                            router.back();
                        } else {
                            router.push('/?view=dashboard'); // fallback if no back history
                        }
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>
                <div className={styles.headerCenter}>
                    <h1>Zecure AI Agent</h1>
                    <span className={styles.subtitle}>ZPT Assistant</span>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.statusBadge}>
                        <span
                            className={styles.statusDot}
                            style={{ color: statusIndicator.color }}
                        >
                            {statusIndicator.icon}
                        </span>
                        <span>{systemStatus}</span>
                    </div>
                </div>
            </header>

            {/* Cards Grid */}
            <main className={styles.cardsGrid}>
                {/* Welcome Card */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <h2>System Overview</h2>
                            <span className={styles.cardSubtitle}>Real-time monitoring</span>
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.welcomeContent}>
                            <p className={styles.greeting}>{currentTime}</p>
                            <p className={styles.statusMessage}>All systems secure and operational</p>
                            <div className={styles.lastScanInfo}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12,6 12,12 16,14" />
                                </svg>
                                <span>Last scan: {lastScan}</span>
                            </div>
                        </div>
                        <button className={styles.primaryButton}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span>Run Security Scan</span>
                        </button>
                    </div>
                </section>

                {/* Threat Overview */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <h2>Threat Landscape</h2>
                            <span className={styles.cardSubtitle}>Last 24 hours</span>
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.threatOverview}>
                            <div className={styles.threatChart}>
                                <svg viewBox="0 0 120 120" className={styles.donutChart}>
                                    <circle cx="60" cy="60" r="45" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                    {threats.map((threat, index) => {
                                        const total = threats.reduce((sum, t) => sum + t.count, 0);
                                        const percentage = (threat.count / total) * 100;
                                        const circumference = 2 * Math.PI * 45;
                                        const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                                        const strokeDashoffset = -circumference * 0.25 - (index > 0 ? threats.slice(0, index).reduce((sum, t) => sum + (t.count / total) * circumference, 0) : 0);

                                        return (
                                            <circle
                                                key={threat.id}
                                                cx="60"
                                                cy="60"
                                                r="45"
                                                fill="none"
                                                stroke={threat.color}
                                                strokeWidth="12"
                                                strokeDasharray={strokeDasharray}
                                                strokeDashoffset={strokeDashoffset}
                                                transform="rotate(-90 60 60)"
                                                strokeLinecap="round"
                                            />
                                        );
                                    })}
                                </svg>
                                <div className={styles.chartCenter}>
                                    <span className={styles.totalThreats}>
                                        {threats.reduce((sum, t) => sum + t.count, 0)}
                                    </span>
                                    <span className={styles.chartLabel}>Threats</span>
                                </div>
                            </div>
                            <div className={styles.threatLegend}>
                                {threats.map(threat => (
                                    <div key={threat.id} className={styles.legendItem}>
                                        <span
                                            className={styles.legendDot}
                                            style={{ backgroundColor: threat.color }}
                                        ></span>
                                        <span className={styles.legendLabel}>{threat.type}</span>
                                        <span className={styles.legendCount}>{threat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Active Investigations */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <h2>Active Investigations</h2>
                            <span className={styles.cardSubtitle}>{investigations.length} ongoing</span>
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.investigationsList}>
                            {investigations.map(investigation => (
                                <div key={investigation.id} className={styles.investigationItem}>
                                    <div className={styles.investigationContent}>
                                        <div className={styles.investigationHeader}>
                                            <h4>{investigation.type}</h4>
                                            <span className={`${styles.statusTag} ${styles[investigation.status.toLowerCase().replace(' ', '')]}`}>
                                                {investigation.status}
                                            </span>
                                        </div>
                                        <div className={styles.riskLevel}>
                                            <span>Risk Level: {investigation.risk}%</span>
                                        </div>
                                    </div>
                                    <ProgressRing
                                        progress={investigation.risk}
                                        size={50}
                                        strokeWidth={4}
                                        color={investigation.risk > 70 ? '#ef4444' : investigation.risk > 40 ? '#f59e0b' : '#10b981'}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Smart Recommendations */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <h2>Smart Recommendations</h2>
                            <span className={styles.cardSubtitle}>AI-powered suggestions</span>
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.recommendationsList}>
                            {recommendations.map(rec => (
                                <div key={rec.id} className={`${styles.recommendationItem} ${rec.accepted !== undefined ? styles.processed : ''}`}>
                                    <div className={styles.recommendationContent}>
                                        <span className={styles.recommendationIcon}>{rec.icon}</span>
                                        <span className={styles.recommendationText}>{rec.text}</span>
                                    </div>
                                    {rec.accepted === undefined ? (
                                        <div className={styles.recommendationActions}>
                                            <button
                                                className={styles.acceptBtn}
                                                onClick={() => handleRecommendationAction(rec.id, 'accept')}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className={styles.ignoreBtn}
                                                onClick={() => handleRecommendationAction(rec.id, 'ignore')}
                                            >
                                                Ignore
                                            </button>
                                        </div>
                                    ) : (
                                        <span className={`${styles.actionResult} ${rec.accepted ? styles.accepted : styles.ignored}`}>
                                            {rec.accepted ? '✓ Applied' : '✕ Dismissed'}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <h2>Quick Actions</h2>
                            <span className={styles.cardSubtitle}>Common tasks</span>
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.quickActionsGrid}>
                            <button className={styles.actionButton}>
                                <div className={styles.actionIcon}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <span>Full Scan</span>
                            </button>
                            <button className={styles.actionButton}>
                                <div className={styles.actionIcon}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                    </svg>
                                </div>
                                <span>Generate Report</span>
                            </button>
                            <button className={styles.actionButton}>
                                <div className={styles.actionIcon}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                </div>
                                <span>Investigate</span>
                            </button>
                            <button className={styles.actionButton}>
                                <div className={styles.actionIcon}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
                                    </svg>
                                </div>
                                <span>Threat Sim</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ZPT Conversation */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <h2>ZPT Assistant</h2>
                            <span className={styles.cardSubtitle}>AI-powered security assistant</span>
                        </div>
                        <div className={styles.chatTabs}>
                            <button
                                className={`${styles.tab} ${activeTab === 'ask' ? styles.active : ''}`}
                                onClick={() => setActiveTab('ask')}
                            >
                                Chat
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'alerts' ? styles.active : ''}`}
                                onClick={() => setActiveTab('alerts')}
                            >
                                Alerts
                            </button>
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.chatContainer}>
                            <div
                                className={styles.chatMessages}
                                ref={chatMessagesRef}
                            >
                                {messages.map(message => (
                                    <div key={message.id} className={`${styles.message} ${styles[message.sender]}`}>
                                        <div className={styles.messageContent}>
                                            <p>{message.text}</p>
                                            <time>{message.timestamp}</time>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className={`${styles.message} ${styles.zpt}`}>
                                        <div className={styles.messageContent}>
                                            <div className={styles.typingIndicator}>
                                                <span></span><span></span><span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className={styles.chatInput}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Ask ZPT anything about your security..."
                                />
                                <button onClick={sendMessage} disabled={!input.trim()}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 2L11 13" />
                                        <polygon points="22,2 15,22 11,13 2,9 22,2" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
