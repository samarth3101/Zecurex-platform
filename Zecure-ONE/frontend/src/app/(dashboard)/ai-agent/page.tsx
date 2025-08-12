'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ai-agent.module.scss';

interface ChatMessage {
    id: string;
    type: 'user' | 'agent';
    message: string;
    timestamp: string;
}

interface AgentCapability {
    name: string;
    description: string;
    status: 'active' | 'learning' | 'analyzing';
    icon: string;
}

export default function AIAgent() {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [agentStatus, setAgentStatus] = useState('active');

    const capabilities: AgentCapability[] = [
        {
            name: 'Threat Analysis',
            description: 'Real-time threat detection and risk assessment',
            status: 'active',
            icon: '🛡️'
        },
        {
            name: 'Vulnerability Scanning',
            description: 'Automated security vulnerability identification',
            status: 'analyzing',
            icon: '🔍'
        },
        {
            name: 'Incident Response',
            description: 'Automated incident handling and remediation',
            status: 'active',
            icon: '🚨'
        },
        {
            name: 'Compliance Monitoring',
            description: 'Continuous compliance assessment and reporting',
            status: 'learning',
            icon: '📋'
        }
    ];

    useEffect(() => {
        // Check access permissions
        const masterMode = localStorage.getItem('zecure-master-mode') === 'true';
        if (!masterMode) {
            router.push('/dashboard');
            return;
        }
        setHasAccess(true);

        // Initialize with welcome message
        setMessages([
            {
                id: '1',
                type: 'agent',
                message: 'Hello! I\'m ZPT, your AI-powered security assistant. I\'m currently monitoring your security infrastructure and can help you with threat analysis, compliance checks, and security recommendations. How can I assist you today?',
                timestamp: 'now'
            }
        ]);
    }, [router]);

    const sendMessage = async () => {
        if (!currentMessage.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            message: currentMessage,
            timestamp: 'now'
        };

        setMessages(prev => [...prev, userMessage]);
        setCurrentMessage('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const responses = [
                "I've analyzed your security posture and found 3 potential vulnerabilities. Would you like me to provide detailed remediation steps?",
                "Based on recent threat intelligence, I recommend updating your firewall rules. I can automate this process for you.",
                "I've detected unusual network activity. Running advanced behavioral analysis now. Results will be available in 2 minutes.",
                "Your current compliance score is 94.2%. I've identified 2 areas for improvement to reach 99%+ compliance.",
                "Security scan completed. Found 0 critical issues, 2 medium-priority items that I can help resolve automatically."
            ];

            const agentResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'agent',
                message: responses[Math.floor(Math.random() * responses.length)],
                timestamp: 'now'
            };

            setMessages(prev => [...prev, agentResponse]);
            setIsTyping(false);
        }, 2000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!hasAccess) {
        return null;
    }

    return (
        <div className={styles.aiAgentPage}>
            <header className={styles.header}>
                <button className={styles.backButton} onClick={() => router.push('/dashboard')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Dashboard
                </button>
                <div className={styles.headerInfo}>
                    <h1>
                        Zecure AI Agent (ZPT)
                        <span className={styles.premiumBadge}>PREMIUM</span>
                    </h1>
                    <p>Advanced AI-powered security automation and assistance</p>
                </div>
                <div className={styles.agentStatus}>
                    <div className={`${styles.statusIndicator} ${styles[agentStatus]}`}></div>
                    <span>Agent Status: {agentStatus.charAt(0).toUpperCase() + agentStatus.slice(1)}</span>
                </div>
            </header>

            <div className={styles.agentDashboard}>
                <div className={styles.capabilitiesPanel}>
                    <h3>AI Capabilities</h3>
                    <div className={styles.capabilitiesList}>
                        {capabilities.map((capability, index) => (
                            <div key={index} className={`${styles.capabilityCard} ${styles[capability.status]}`}>
                                <div className={styles.capabilityIcon}>{capability.icon}</div>
                                <div className={styles.capabilityInfo}>
                                    <h4>{capability.name}</h4>
                                    <p>{capability.description}</p>
                                    <div className={`${styles.capabilityStatus} ${styles[capability.status]}`}>
                                        {capability.status.charAt(0).toUpperCase() + capability.status.slice(1)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.chatInterface}>
                    <div className={styles.chatHeader}>
                        <div className={styles.agentAvatar}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="16" height="12" x="4" y="8" rx="2"/>
                                <path d="M2 14h2"/>
                                <path d="M20 14h2"/>
                                <circle cx="12" cy="11" r="2" fill="currentColor"/>
                            </svg>
                        </div>
                        <div className={styles.agentInfo}>
                            <h3>ZPT AI Assistant</h3>
                            <p>Advanced Security Intelligence</p>
                        </div>
                        <div className={styles.agentMetrics}>
                            <div className={styles.metric}>
                                <span className={styles.metricValue}>247</span>
                                <span className={styles.metricLabel}>Threats Analyzed</span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.metricValue}>5s</span>
                                <span className={styles.metricLabel}>Response Time</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.chatMessages}>
                        {messages.map(message => (
                            <div key={message.id} className={`${styles.message} ${styles[message.type]}`}>
                                <div className={styles.messageContent}>
                                    <p>{message.message}</p>
                                    <span className={styles.messageTime}>{message.timestamp}</span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className={`${styles.message} ${styles.agent}`}>
                                <div className={styles.messageContent}>
                                    <div className={styles.typingIndicator}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.chatInput}>
                        <div className={styles.inputGroup}>
                            <textarea
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask ZPT about security threats, compliance, or get recommendations..."
                                className={styles.messageInput}
                                rows={3}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!currentMessage.trim()}
                                className={styles.sendButton}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                                </svg>
                            </button>
                        </div>
                        <div className={styles.quickActions}>
                            <button 
                                className={styles.quickAction}
                                onClick={() => setCurrentMessage('Run a comprehensive security scan')}
                            >
                                Security Scan
                            </button>
                            <button 
                                className={styles.quickAction}
                                onClick={() => setCurrentMessage('Check compliance status')}
                            >
                                Compliance Check
                            </button>
                            <button 
                                className={styles.quickAction}
                                onClick={() => setCurrentMessage('Analyze recent threats')}
                            >
                                Threat Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
