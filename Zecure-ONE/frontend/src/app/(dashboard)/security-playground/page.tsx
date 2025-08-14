'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './security-playground.module.scss';

interface SecurityTool {
    id: string;
    name: string;
    category: 'Network' | 'Web App' | 'Endpoint' | 'Cloud' | 'Mobile';
    lastUsed: string;
    status: 'available' | 'running' | 'completed' | 'failed';
    description: string;
    configurable: boolean;
    estimatedTime: string;
    complexity: 'low' | 'medium' | 'high';
    logs: LogEntry[];
    progress: number;
    vulnerabilitiesFound: number;
}

interface LogEntry {
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success';
    message: string;
    details?: string;
}

interface Simulation {
    id: string;
    name: string;
    difficulty: 'low' | 'medium' | 'high';
    runtime: string;
    description: string;
    status: 'available' | 'running' | 'completed' | 'failed';
    category: 'phishing' | 'ddos' | 'injection' | 'malware' | 'social_engineering';
    progress: number;
    currentPhase: string;
    detectionRate: number;
    attacksBlocked: number;
    timeline: TimelineEvent[];
}

interface TimelineEvent {
    id: string;
    time: string;
    event: string;
    type: 'attack' | 'defense' | 'neutral';
    severity: 'low' | 'medium' | 'high' | 'critical';
    completed: boolean;
    impact: string;
}

interface TrainingModel {
    id: string;
    name: string;
    dataset: string;
    progress: number;
    stage: 'upload' | 'preprocess' | 'train' | 'evaluate' | 'complete';
    accuracy: { before: number; after: number };
    metrics: {
        precision: number;
        recall: number;
        f1Score: number;
        falsePositives: number;
    };
    trainingTime: string;
    dataPoints: number;
    epochsCompleted: number;
    totalEpochs: number;
    learningRate: number;
    batchSize: number;
}

interface ActivityItem {
    id: string;
    timestamp: string;
    action: string;
    type: 'test' | 'simulation' | 'training' | 'report' | 'alert';
    status: 'success' | 'warning' | 'error' | 'info';
    details: string;
    impact: 'low' | 'medium' | 'high';
}

interface SystemAlert {
    id: string;
    type: 'security' | 'performance' | 'resource' | 'update';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    timestamp: string;
    acknowledged: boolean;
    actionRequired: boolean;
}

interface NetworkNode {
    id: string;
    name: string;
    type: 'server' | 'database' | 'workstation' | 'router' | 'firewall';
    status: 'healthy' | 'warning' | 'critical' | 'compromised';
    connections: string[];
    lastSeen: string;
    vulnerabilities: number;
    cpuUsage?: number;
    memoryUsage?: number;
    diskUsage?: number;
    networkTraffic?: number;
}

interface NetworkConnection {
    source: string;
    target: string;
    type: 'normal' | 'suspicious' | 'malicious';
    bandwidth: number;
    latency: number;
}

type ActiveView = 'overview' | 'test-tools' | 'simulations' | 'model-training' | 'reports' | 'network-map' | 'alerts';

// Helper function to create log entries with proper typing
const createLogEntry = (
    level: 'info' | 'warning' | 'error' | 'success',
    message: string,
    details?: string
): LogEntry => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    level,
    message,
    details
});

export default function SecurityPlayground() {
    const router = useRouter();
    const [activeView, setActiveView] = useState<ActiveView>('overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedTool, setSelectedTool] = useState<SecurityTool | null>(null);
    const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
    const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
    const [notifications, setNotifications] = useState(8);
    const [realTimeUpdates, setRealTimeUpdates] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(5000);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const logContainerRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Enhanced mock data with more functionality
    const [systemHealth] = useState({
        overall: 94,
        network: 98,
        endpoints: 91,
        applications: 96,
        threats: 89
    });

    const [kpis, setKpis] = useState({
        activeSimulations: 6,
        modelsInTraining: 3,
        lastCompletedTest: '23 minutes ago',
        sandboxSessions: 18,
        threatsDetected: 47,
        vulnerabilitiesFound: 23,
        attacksBlocked: 156,
        systemUptime: '99.8%'
    });

    const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([
        {
            id: '1',
            type: 'security',
            severity: 'high',
            title: 'Unusual Network Activity Detected',
            message: 'Multiple failed login attempts from IP range 192.168.100.x',
            timestamp: '2 minutes ago',
            acknowledged: false,
            actionRequired: true
        },
        {
            id: '2',
            type: 'performance',
            severity: 'medium',
            title: 'High CPU Usage',
            message: 'Analysis engine using 87% CPU for extended period',
            timestamp: '5 minutes ago',
            acknowledged: false,
            actionRequired: false
        },
        {
            id: '3',
            type: 'resource',
            severity: 'low',
            title: 'Disk Space Warning',
            message: 'Log partition at 78% capacity',
            timestamp: '12 minutes ago',
            acknowledged: true,
            actionRequired: false
        }
    ]);

    const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([
        {
            id: 'web-server-01',
            name: 'Web Server 01',
            type: 'server',
            status: 'healthy',
            connections: ['database-01', 'firewall-01'],
            lastSeen: '1 minute ago',
            vulnerabilities: 0,
            cpuUsage: 24,
            memoryUsage: 67,
            diskUsage: 45,
            networkTraffic: 156
        },
        {
            id: 'database-01',
            name: 'Primary Database',
            type: 'database',
            status: 'warning',
            connections: ['web-server-01', 'backup-server'],
            lastSeen: '30 seconds ago',
            vulnerabilities: 2,
            cpuUsage: 78,
            memoryUsage: 89,
            diskUsage: 92,
            networkTraffic: 234
        },
        {
            id: 'workstation-05',
            name: 'Admin Workstation',
            type: 'workstation',
            status: 'compromised',
            connections: ['router-01'],
            lastSeen: '5 minutes ago',
            vulnerabilities: 8,
            cpuUsage: 95,
            memoryUsage: 98,
            diskUsage: 67,
            networkTraffic: 445
        },
        {
            id: 'firewall-01',
            name: 'Main Firewall',
            type: 'firewall',
            status: 'healthy',
            connections: ['web-server-01', 'router-01'],
            lastSeen: '15 seconds ago',
            vulnerabilities: 0,
            cpuUsage: 12,
            memoryUsage: 34,
            diskUsage: 23,
            networkTraffic: 78
        },
        {
            id: 'router-01',
            name: 'Core Router',
            type: 'router',
            status: 'critical',
            connections: ['firewall-01', 'workstation-05'],
            lastSeen: '2 minutes ago',
            vulnerabilities: 3,
            cpuUsage: 87,
            memoryUsage: 76,
            diskUsage: 45,
            networkTraffic: 523
        }
    ]);

    const [networkConnections] = useState<NetworkConnection[]>([
        {
            source: 'web-server-01',
            target: 'database-01',
            type: 'normal',
            bandwidth: 1024,
            latency: 2
        },
        {
            source: 'web-server-01',
            target: 'firewall-01',
            type: 'normal',
            bandwidth: 512,
            latency: 1
        },
        {
            source: 'workstation-05',
            target: 'router-01',
            type: 'suspicious',
            bandwidth: 2048,
            latency: 45
        },
        {
            source: 'firewall-01',
            target: 'router-01',
            type: 'malicious',
            bandwidth: 4096,
            latency: 89
        }
    ]);

    const [securityTools, setSecurityTools] = useState<SecurityTool[]>([
        {
            id: 'nmap',
            name: 'Network Mapper (Nmap)',
            category: 'Network',
            lastUsed: '2024-01-15',
            status: 'available',
            description: 'Network discovery and security auditing',
            configurable: true,
            estimatedTime: '5-15 minutes',
            complexity: 'medium',
            logs: [],
            progress: 0,
            vulnerabilitiesFound: 0
        },
        {
            id: 'burp',
            name: 'Burp Suite Professional',
            category: 'Web App',
            lastUsed: '2024-01-14',
            status: 'running',
            description: 'Web application security testing',
            configurable: true,
            estimatedTime: '15-45 minutes',
            complexity: 'high',
            logs: [
                {
                    id: '1',
                    timestamp: '14:23:15',
                    level: 'info',
                    message: 'Starting web application scan',
                    details: 'Target: https://demo.testfire.net'
                },
                {
                    id: '2',
                    timestamp: '14:23:42',
                    level: 'warning',
                    message: 'Potential SQL injection found',
                    details: 'Parameter: search, Method: GET'
                }
            ],
            progress: 65,
            vulnerabilitiesFound: 4
        },
        {
            id: 'wireshark',
            name: 'Wireshark',
            category: 'Network',
            lastUsed: '2024-01-13',
            status: 'completed',
            description: 'Network protocol analyzer',
            configurable: false,
            estimatedTime: '10-30 minutes',
            complexity: 'medium',
            logs: [
                {
                    id: '1',
                    timestamp: '13:45:22',
                    level: 'success',
                    message: 'Packet capture completed',
                    details: '1,247 packets captured'
                }
            ],
            progress: 100,
            vulnerabilitiesFound: 0
        },
        {
            id: 'metasploit',
            name: 'Metasploit Framework',
            category: 'Endpoint',
            lastUsed: '2024-01-12',
            status: 'available',
            description: 'Penetration testing framework',
            configurable: true,
            estimatedTime: '20-60 minutes',
            complexity: 'high',
            logs: [],
            progress: 0,
            vulnerabilitiesFound: 0
        },
        {
            id: 'nuclei',
            name: 'Nuclei Scanner',
            category: 'Web App',
            lastUsed: '2024-01-11',
            status: 'available',
            description: 'Fast vulnerability scanner',
            configurable: true,
            estimatedTime: '3-10 minutes',
            complexity: 'low',
            logs: [],
            progress: 0,
            vulnerabilitiesFound: 0
        }
    ]);

    const [simulations, setSimulations] = useState<Simulation[]>([
        {
            id: 'phishing-campaign',
            name: 'Advanced Phishing Campaign',
            difficulty: 'medium',
            runtime: '2-4 hours',
            description: 'Simulate sophisticated email phishing attacks targeting employee credentials',
            status: 'running',
            category: 'phishing',
            progress: 45,
            currentPhase: 'Email Delivery',
            detectionRate: 76,
            attacksBlocked: 12,
            timeline: [
                {
                    id: '1',
                    time: '14:00',
                    event: 'Reconnaissance phase initiated',
                    type: 'attack',
                    severity: 'low',
                    completed: true,
                    impact: 'Information gathering started'
                },
                {
                    id: '2',
                    time: '14:15',
                    event: 'Target email addresses harvested',
                    type: 'attack',
                    severity: 'medium',
                    completed: true,
                    impact: '247 email addresses collected'
                },
                {
                    id: '3',
                    time: '14:30',
                    event: 'Malicious emails sent to targets',
                    type: 'attack',
                    severity: 'high',
                    completed: false,
                    impact: 'Phishing campaign launched'
                }
            ]
        },
        {
            id: 'ddos-attack',
            name: 'Distributed Denial of Service',
            difficulty: 'high',
            runtime: '1-2 hours',
            description: 'Test infrastructure resilience against volumetric attacks',
            status: 'available',
            category: 'ddos',
            progress: 0,
            currentPhase: 'Ready to Launch',
            detectionRate: 0,
            attacksBlocked: 0,
            timeline: []
        },
        {
            id: 'sql-injection',
            name: 'SQL Injection Assessment',
            difficulty: 'low',
            runtime: '30-60 minutes',
            description: 'Identify and exploit database vulnerabilities in web applications',
            status: 'completed',
            category: 'injection',
            progress: 100,
            currentPhase: 'Completed',
            detectionRate: 94,
            attacksBlocked: 8,
            timeline: []
        },
        {
            id: 'social-engineering',
            name: 'Social Engineering Attack',
            difficulty: 'high',
            runtime: '3-6 hours',
            description: 'Multi-vector social engineering campaign testing human factors',
            status: 'available',
            category: 'social_engineering',
            progress: 0,
            currentPhase: 'Configuration',
            detectionRate: 0,
            attacksBlocked: 0,
            timeline: []
        }
    ]);

    const [trainingModels, setTrainingModels] = useState<TrainingModel[]>([
        {
            id: 'malware-detection',
            name: 'Advanced Malware Detection',
            dataset: 'Corporate Endpoint Logs (2.3GB)',
            progress: 100,
            stage: 'complete',
            accuracy: { before: 82.5, after: 96.8 },
            metrics: {
                precision: 94.2,
                recall: 91.7,
                f1Score: 92.9,
                falsePositives: 23
            },
            trainingTime: '2h 34m',
            dataPoints: 1247856,
            epochsCompleted: 100,
            totalEpochs: 100,
            learningRate: 0.001,
            batchSize: 64
        },
        {
            id: 'network-anomaly',
            name: 'Network Anomaly Detection',
            dataset: 'Network Traffic Patterns (890MB)',
            progress: 78,
            stage: 'train',
            accuracy: { before: 76.8, after: 89.1 },
            metrics: {
                precision: 87.4,
                recall: 83.2,
                f1Score: 85.2,
                falsePositives: 45
            },
            trainingTime: '1h 12m',
            dataPoints: 892341,
            epochsCompleted: 78,
            totalEpochs: 100,
            learningRate: 0.0005,
            batchSize: 32
        },
        {
            id: 'threat-classification',
            name: 'Threat Classification Engine',
            dataset: 'Security Events Dataset (1.7GB)',
            progress: 25,
            stage: 'preprocess',
            accuracy: { before: 0, after: 0 },
            metrics: {
                precision: 0,
                recall: 0,
                f1Score: 0,
                falsePositives: 0
            },
            trainingTime: '0m',
            dataPoints: 2147483,
            epochsCompleted: 0,
            totalEpochs: 150,
            learningRate: 0.002,
            batchSize: 128
        }
    ]);

    const [activityTimeline, setActivityTimeline] = useState<ActivityItem[]>([
        {
            id: '1',
            timestamp: '14:23',
            action: 'SQL Injection test completed',
            type: 'test',
            status: 'success',
            details: '8 vulnerabilities found, 2 critical',
            impact: 'high'
        },
        {
            id: '2',
            timestamp: '14:15',
            action: 'Phishing simulation started',
            type: 'simulation',
            status: 'info',
            details: 'Targeting 247 email addresses',
            impact: 'medium'
        },
        {
            id: '3',
            timestamp: '14:08',
            action: 'Model training progress update',
            type: 'training',
            status: 'info',
            details: 'Network anomaly detection at 78%',
            impact: 'low'
        },
        {
            id: '4',
            timestamp: '14:02',
            action: 'Security alert triggered',
            type: 'alert',
            status: 'warning',
            details: 'Unusual network activity detected',
            impact: 'high'
        },
        {
            id: '5',
            timestamp: '13:55',
            action: 'Compliance report generated',
            type: 'report',
            status: 'success',
            details: 'Q4 security assessment completed',
            impact: 'medium'
        }
    ]);

    // Real-time updates effect
    useEffect(() => {
        if (autoRefresh && realTimeUpdates) {
            intervalRef.current = setInterval(() => {
                updateSystemMetrics();
                updateRunningSimulations();
                updateTrainingProgress();
                updateNetworkMetrics();
            }, refreshInterval);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [autoRefresh, realTimeUpdates, refreshInterval]);

    const updateSystemMetrics = useCallback(() => {
        setKpis(prev => ({
            ...prev,
            threatsDetected: prev.threatsDetected + Math.floor(Math.random() * 3),
            attacksBlocked: prev.attacksBlocked + Math.floor(Math.random() * 5)
        }));
    }, []);

    const updateRunningSimulations = useCallback(() => {
        setSimulations(prev => prev.map(sim => {
            if (sim.status === 'running' && sim.progress < 100) {
                const newProgress = Math.min(sim.progress + Math.floor(Math.random() * 5), 100);
                return {
                    ...sim,
                    progress: newProgress,
                    attacksBlocked: sim.attacksBlocked + Math.floor(Math.random() * 2),
                    status: newProgress >= 100 ? 'completed' as const : sim.status
                };
            }
            return sim;
        }));
    }, []);

    const updateTrainingProgress = useCallback(() => {
        setTrainingModels(prev => prev.map(model => {
            if (model.stage === 'train' && model.progress < 100) {
                const newProgress = Math.min(model.progress + Math.floor(Math.random() * 3), 100);
                const newEpochs = Math.floor((newProgress / 100) * model.totalEpochs);
                return {
                    ...model,
                    progress: newProgress,
                    epochsCompleted: newEpochs,
                    accuracy: {
                        ...model.accuracy,
                        after: model.accuracy.before + (newProgress / 100) * 15
                    }
                };
            }
            return model;
        }));
    }, []);

    const updateNetworkMetrics = useCallback(() => {
        setNetworkNodes(prev => prev.map(node => ({
            ...node,
            cpuUsage: Math.max(0, Math.min(100, (node.cpuUsage || 0) + Math.floor(Math.random() * 10 - 5))),
            memoryUsage: Math.max(0, Math.min(100, (node.memoryUsage || 0) + Math.floor(Math.random() * 8 - 4))),
            networkTraffic: Math.max(0, (node.networkTraffic || 0) + Math.floor(Math.random() * 50 - 25))
        })));
    }, []);

    const playNotificationSound = () => {
        if (soundEnabled) {
            console.log('🔊 Playing notification sound');
        }
    };

    const acknowledgeAlert = (alertId: string) => {
        setSystemAlerts(prev => prev.map(alert => 
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ));
        playNotificationSound();
    };

    const runTool = (toolId: string) => {
        setSecurityTools(prev => prev.map(tool => {
            if (tool.id === toolId) {
                const updatedTool: SecurityTool = { 
                    ...tool, 
                    status: 'running',
                    progress: 0,
                    logs: [createLogEntry('info', `Starting ${tool.name}...`, 'Initializing security scan')]
                };

                const progressInterval = setInterval(() => {
                    setSecurityTools(current => current.map(t => {
                        if (t.id === toolId && t.status === 'running') {
                            const newProgress = Math.min(t.progress + Math.floor(Math.random() * 10) + 5, 100);
                            const newLogs: LogEntry[] = [...t.logs];
                            
                            if (newProgress > 25 && newProgress < 30) {
                                newLogs.push(createLogEntry('info', 'Target enumeration completed', 'Discovered 23 open ports'));
                            }
                            
                            if (newProgress > 60 && newProgress < 65) {
                                newLogs.push(createLogEntry('warning', 'Potential vulnerability detected', 'CVE-2023-1234 on port 443'));
                            }

                            if (newProgress >= 100) {
                                clearInterval(progressInterval);
                                newLogs.push(createLogEntry('success', 'Scan completed successfully', `Found ${Math.floor(Math.random() * 10)} potential issues`));
                                
                                return {
                                    ...t,
                                    status: 'completed' as const,
                                    progress: 100,
                                    vulnerabilitiesFound: Math.floor(Math.random() * 15),
                                    logs: newLogs
                                };
                            }

                            return { ...t, progress: newProgress, logs: newLogs };
                        }
                        return t;
                    }));
                }, 1000);

                return updatedTool;
            }
            return tool;
        }));

        const newActivity: ActivityItem = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            action: `Started ${securityTools.find(t => t.id === toolId)?.name || 'Security Tool'}`,
            type: 'test',
            status: 'info',
            details: 'Security tool execution initiated',
            impact: 'medium'
        };
        
        setActivityTimeline(prev => [newActivity, ...prev.slice(0, 9)]);
        playNotificationSound();
    };

    const launchSimulation = (simulationId: string) => {
        setSimulations(prev => prev.map(sim => {
            if (sim.id === simulationId) {
                return {
                    ...sim,
                    status: 'running' as const,
                    progress: 0,
                    currentPhase: 'Initialization'
                };
            }
            return sim;
        }));

        const newActivity: ActivityItem = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            action: `Launched ${simulations.find(s => s.id === simulationId)?.name || 'Simulation'}`,
            type: 'simulation',
            status: 'info',
            details: 'Attack simulation started',
            impact: 'high'
        };
        
        setActivityTimeline(prev => [newActivity, ...prev.slice(0, 9)]);
        playNotificationSound();
    };

    const startTrainingModel = (modelType: 'custom' | 'advanced' = 'advanced') => {
        const newModel: TrainingModel = {
            id: 'model-' + Date.now(),
            name: modelType === 'custom' ? 'Custom Threat Model' : 'Advanced Threat Intelligence',
            dataset: 'Multi-source Threat Data (4.2GB)',
            progress: 0,
            stage: 'upload',
            accuracy: { before: 0, after: 0 },
            metrics: {
                precision: 0,
                recall: 0,
                f1Score: 0,
                falsePositives: 0
            },
            trainingTime: '0m',
            dataPoints: 3245678,
            epochsCompleted: 0,
            totalEpochs: 100,
            learningRate: 0.001,
            batchSize: 64
        };

        setTrainingModels(prev => [...prev, newModel]);
        
        // Auto-start training
        setTimeout(() => {
            setTrainingModels(current => current.map(model => 
                model.id === newModel.id ? { ...model, stage: 'train' as const } : model
            ));
        }, 2000);

        playNotificationSound();
    };

    const resetEnvironment = () => {
        setShowConfirmModal(true);
    };

    const confirmReset = () => {
        setSecurityTools(prev => prev.map(tool => ({ 
            ...tool, 
            status: 'available' as const,
            progress: 0,
            logs: [],
            vulnerabilitiesFound: 0
        })));
        setSimulations(prev => prev.map(sim => ({ 
            ...sim, 
            status: 'available' as const,
            progress: 0,
            currentPhase: 'Ready to Launch',
            detectionRate: 0,
            attacksBlocked: 0
        })));
        setTrainingModels([]);
        setSystemAlerts([]);
        setShowConfirmModal(false);
        playNotificationSound();
    };

    const exportLogs = () => {
        const logs = securityTools.flatMap(tool => tool.logs);
        const logData = JSON.stringify(logs, null, 2);
        const blob = new Blob([logData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const generateReport = () => {
        const reportData = {
            timestamp: new Date().toISOString(),
            systemHealth,
            kpis,
            completedTests: securityTools.filter(t => t.status === 'completed').length,
            activeSimulations: simulations.filter(s => s.status === 'running').length,
            totalVulnerabilities: securityTools.reduce((sum, tool) => sum + tool.vulnerabilitiesFound, 0),
            modelAccuracy: trainingModels.map(m => ({ name: m.name, accuracy: m.accuracy.after }))
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleNodeClick = (node: NetworkNode) => {
        setSelectedNode(node);
    };

    const isolateNode = (nodeId: string) => {
        setNetworkNodes(prev => prev.map(node => 
            node.id === nodeId 
                ? { ...node, status: 'warning' as const, connections: [] }
                : { ...node, connections: node.connections.filter(conn => conn !== nodeId) }
        ));
        setSelectedNode(null);
        playNotificationSound();
    };

    const filteredTools = securityTools.filter(tool =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'running': return styles.statusRunning;
            case 'completed': return styles.statusCompleted;
            case 'failed': return styles.statusFailed;
            case 'available': return styles.statusAvailable;
            default: return styles.statusAvailable;
        }
    };

    const getDifficultyClass = (difficulty: string) => {
        switch (difficulty) {
            case 'low': return styles.difficultyLow;
            case 'medium': return styles.difficultyMedium;
            case 'high': return styles.difficultyHigh;
            default: return styles.difficultyLow;
        }
    };

    const getSeverityClass = (severity: string) => {
        switch (severity) {
            case 'low': return styles.severityLow;
            case 'medium': return styles.severityMedium;
            case 'high': return styles.severityHigh;
            case 'critical': return styles.severityCritical;
            default: return styles.severityLow;
        }
    };

    const getNodeStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return '#10b981';
            case 'warning': return '#f59e0b';
            case 'critical': return '#ef4444';
            case 'compromised': return '#dc2626';
            default: return '#6b7280';
        }
    };

    useEffect(() => {
        const masterMode = localStorage.getItem('zecure-master-mode') === 'true';
        if (!masterMode) {
            router.push('/');
            return;
        }
    }, [router]);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [selectedTool?.logs]);

    return (
        <div className={styles.playgroundPage}>
            {/* Enhanced Header with Exit Button */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button onClick={() => router.push('/')} className={styles.exitButton}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16,17 21,12 16,7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span>Exit</span>
                    </button>
                    
                    <div className={styles.systemHealthIndicator}>
                        <div className={styles.healthBar}>
                            <div 
                                className={styles.healthFill} 
                                style={{ width: `${systemHealth.overall}%` }}
                            ></div>
                        </div>
                        <span className={styles.healthText}>System Health: {systemHealth.overall}%</span>
                    </div>
                </div>

                <div className={styles.headerCenter}>
                    <h1>Security Operations Center</h1>
                    <span className={styles.subtitle}>Advanced Threat Detection & Response Platform</span>
                </div>

                <div className={styles.headerRight}>
                    <div className={styles.realTimeControls}>
                        <button 
                            className={`${styles.toggleButton} ${realTimeUpdates ? styles.active : ''}`}
                            onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                            title="Toggle Real-time Updates"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23,4 23,10 17,10"/>
                                <polyline points="1,20 1,14 7,14"/>
                                <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"/>
                            </svg>
                        </button>
                        
                        <button 
                            className={`${styles.toggleButton} ${soundEnabled ? styles.active : ''}`}
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            title="Toggle Sound Notifications"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {soundEnabled ? (
                                    <>
                                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
                                        <path d="M19.07,4.93a10,10,0,0,1,0,14.14M15.54,8.46a5,5,0,0,1,0,7.07"/>
                                    </>
                                ) : (
                                    <>
                                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/>
                                        <line x1="23" y1="9" x2="17" y2="15"/>
                                        <line x1="17" y1="9" x2="23" y2="15"/>
                                    </>
                                )}
                            </svg>
                        </button>
                    </div>

                    <button 
                        className={styles.notificationButton} 
                        title="Notifications"
                        onClick={() => setActiveView('alerts')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        {notifications > 0 && <span className={styles.notificationBadge}>{notifications}</span>}
                    </button>

                    <div className={styles.sandboxBadge}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        <span>Sandbox</span>
                        <div className={styles.statusDot}></div>
                    </div>
                </div>
            </header>

            <div className={styles.mainContent}>
                {/* Fixed Sidebar */}
                <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
                    <div className={styles.sidebarHeader}>
                        <button 
                            className={styles.collapseButton}
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <line x1="3" y1="12" x2="21" y2="12"/>
                                <line x1="3" y1="18" x2="21" y2="18"/>
                            </svg>
                        </button>
                        {!sidebarCollapsed && (
                            <div className={styles.sidebarTitle}>
                                Security Lab
                            </div>
                        )}
                    </div>

                    <nav className={styles.sidebarNav}>
                        {/* Main Navigation */}
                        <div className={styles.navSection}>
                            {!sidebarCollapsed && <div className={styles.sectionTitle}>Main</div>}
                            
                            <button 
                                className={`${styles.navItem} ${activeView === 'overview' ? styles.active : ''}`}
                                onClick={() => setActiveView('overview')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="9" y1="9" x2="15" y2="9"/>
                                    <line x1="9" y1="15" x2="15" y2="15"/>
                                </svg>
                                {!sidebarCollapsed && <span>Overview</span>}
                                {!sidebarCollapsed && kpis.activeSimulations > 0 && (
                                    <span className={styles.navBadge}>{kpis.activeSimulations}</span>
                                )}
                            </button>

                            <button 
                                className={`${styles.navItem} ${activeView === 'test-tools' ? styles.active : ''}`}
                                onClick={() => setActiveView('test-tools')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                                </svg>
                                {!sidebarCollapsed && <span>Test Tools</span>}
                                {!sidebarCollapsed && securityTools.filter(t => t.status === 'running').length > 0 && (
                                    <span className={styles.navBadge}>
                                        {securityTools.filter(t => t.status === 'running').length}
                                    </span>
                                )}
                            </button>

                            <button 
                                className={`${styles.navItem} ${activeView === 'simulations' ? styles.active : ''}`}
                                onClick={() => setActiveView('simulations')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
                                </svg>
                                {!sidebarCollapsed && <span>Simulations</span>}
                                {!sidebarCollapsed && simulations.filter(s => s.status === 'running').length > 0 && (
                                    <span className={styles.navBadge}>
                                        {simulations.filter(s => s.status === 'running').length}
                                    </span>
                                )}
                            </button>

                            <button 
                                className={`${styles.navItem} ${activeView === 'network-map' ? styles.active : ''}`}
                                onClick={() => setActiveView('network-map')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3"/>
                                    <circle cx="12" cy="2" r="1"/>
                                    <circle cx="12" cy="22" r="1"/>
                                    <circle cx="20" cy="12" r="1"/>
                                    <circle cx="4" cy="12" r="1"/>
                                    <line x1="12" y1="15" x2="12" y2="21"/>
                                    <line x1="12" y1="3" x2="12" y2="9"/>
                                    <line x1="15" y1="12" x2="19" y2="12"/>
                                    <line x1="5" y1="12" x2="9" y2="12"/>
                                </svg>
                                {!sidebarCollapsed && <span>Network Map</span>}
                                {!sidebarCollapsed && networkNodes.filter(n => n.status === 'compromised').length > 0 && (
                                    <span className={styles.navBadgeAlert}>
                                        {networkNodes.filter(n => n.status === 'compromised').length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Analytics Section */}
                        <div className={styles.navSection}>
                            {!sidebarCollapsed && <div className={styles.sectionTitle}>Analytics</div>}
                            
                            <button 
                                className={`${styles.navItem} ${activeView === 'model-training' ? styles.active : ''}`}
                                onClick={() => setActiveView('model-training')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                                </svg>
                                {!sidebarCollapsed && <span>AI Training</span>}
                                {!sidebarCollapsed && trainingModels.filter(m => m.stage === 'train').length > 0 && (
                                    <span className={styles.navBadge}>
                                        {trainingModels.filter(m => m.stage === 'train').length}
                                    </span>
                                )}
                            </button>

                            <button 
                                className={`${styles.navItem} ${activeView === 'alerts' ? styles.active : ''}`}
                                onClick={() => setActiveView('alerts')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {!sidebarCollapsed && <span>Alerts</span>}
                                {!sidebarCollapsed && systemAlerts.filter(a => !a.acknowledged).length > 0 && (
                                    <span className={styles.navBadgeAlert}>
                                        {systemAlerts.filter(a => !a.acknowledged).length}
                                    </span>
                                )}
                            </button>

                            <button 
                                className={`${styles.navItem} ${activeView === 'reports' ? styles.active : ''}`}
                                onClick={() => setActiveView('reports')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14,2 14,8 20,8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10,9 9,9 8,9"/>
                                </svg>
                                {!sidebarCollapsed && <span>Reports</span>}
                            </button>
                        </div>
                    </nav>

                    <div className={styles.sidebarFooter}>
                        <button className={styles.resetButton} onClick={resetEnvironment}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23,4 23,10 17,10"/>
                                <polyline points="1,20 1,14 7,14"/>
                                <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"/>
                            </svg>
                            {!sidebarCollapsed && <span>Reset Environment</span>}
                        </button>
                    </div>
                </aside>

                {/* Scrollable Workspace */}
                <main className={styles.workspace}>
                    {activeView === 'overview' && (
                        <div className={styles.overviewPage}>
                            <div className={styles.pageHeader}>
                                <div className={styles.headerContent}>
                                    <h1>Security Operations Dashboard</h1>
                                    <p>Real-time monitoring and advanced threat simulation platform</p>
                                </div>
                                <div className={styles.headerActions}>
                                    <button className={styles.exportButton} onClick={exportLogs}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15"/>
                                            <polyline points="7,10 12,15 17,10"/>
                                            <line x1="12" y1="15" x2="12" y2="3"/>
                                        </svg>
                                        Export Logs
                                    </button>
                                    <button className={styles.primaryButton} onClick={generateReport}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            <polyline points="14,2 14,8 20,8"/>
                                        </svg>
                                        Generate Report
                                    </button>
                                </div>
                            </div>

                            {/* Enhanced KPI Grid */}
                            <div className={styles.kpiGrid}>
                                <div className={styles.kpiCard}>
                                    <div className={styles.kpiHeader}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
                                        </svg>
                                        <span className={styles.kpiTrend}>+12%</span>
                                    </div>
                                    <div className={styles.kpiValue}>{kpis.activeSimulations}</div>
                                    <div className={styles.kpiLabel}>Active Simulations</div>
                                </div>
                                
                                <div className={styles.kpiCard}>
                                    <div className={styles.kpiHeader}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="3"/>
                                            <path d="M12 1v6M12 17v6"/>
                                        </svg>
                                        <span className={styles.kpiTrend}>+8%</span>
                                    </div>
                                    <div className={styles.kpiValue}>{kpis.modelsInTraining}</div>
                                    <div className={styles.kpiLabel}>AI Models Training</div>
                                </div>
                                
                                <div className={styles.kpiCard}>
                                    <div className={styles.kpiHeader}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                        </svg>
                                        <span className={styles.kpiTrend}>+23%</span>
                                    </div>
                                    <div className={styles.kpiValue}>{kpis.threatsDetected}</div>
                                    <div className={styles.kpiLabel}>Threats Detected</div>
                                </div>
                                
                                <div className={styles.kpiCard}>
                                    <div className={styles.kpiHeader}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 12l2 2 4-4"/>
                                            <circle cx="12" cy="12" r="10"/>
                                        </svg>
                                        <span className={styles.kpiTrend}>+45%</span>
                                    </div>
                                    <div className={styles.kpiValue}>{kpis.attacksBlocked}</div>
                                    <div className={styles.kpiLabel}>Attacks Blocked</div>
                                </div>
                            </div>

                            {/* System Health Dashboard */}
                            <div className={styles.section}>
                                <h2>System Health Monitor</h2>
                                <div className={styles.healthGrid}>
                                    {Object.entries(systemHealth).map(([key, value]) => (
                                        <div key={key} className={styles.healthCard}>
                                            <div className={styles.healthHeader}>
                                                <span className={styles.healthName}>
                                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                                </span>
                                                <span className={`${styles.healthValue} ${value >= 95 ? styles.excellent : value >= 85 ? styles.good : styles.warning}`}>
                                                    {value}%
                                                </span>
                                            </div>
                                            <div className={styles.healthBar}>
                                                <div 
                                                    className={styles.healthProgress}
                                                    style={{ width: `${value}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Enhanced Activity Timeline */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2>Real-time Activity Stream</h2>
                                    <div className={styles.refreshIndicator}>
                                        <div className={`${styles.pulse} ${realTimeUpdates ? styles.active : ''}`}></div>
                                        <span>Live Updates {realTimeUpdates ? 'ON' : 'OFF'}</span>
                                    </div>
                                </div>
                                <div className={styles.activityTimeline}>
                                    {activityTimeline.map(activity => (
                                        <div key={activity.id} className={styles.activityItem}>
                                            <div className={`${styles.activityIcon} ${styles[activity.type]} ${styles[activity.impact]}`}>
                                                {activity.type === 'test' && (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                                                    </svg>
                                                )}
                                                {activity.type === 'simulation' && (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
                                                    </svg>
                                                )}
                                                {activity.type === 'training' && (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="3"/>
                                                        <path d="M12 1v6M12 17v6"/>
                                                    </svg>
                                                )}
                                                {activity.type === 'alert' && (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10"/>
                                                        <line x1="12" y1="8" x2="12" y2="12"/>
                                                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                                                    </svg>
                                                )}
                                                {activity.type === 'report' && (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <div className={styles.activityContent}>
                                                <div className={styles.activityHeader}>
                                                    <div className={styles.activityAction}>{activity.action}</div>
                                                    <div className={styles.activityTime}>{activity.timestamp}</div>
                                                </div>
                                                <div className={styles.activityDetails}>{activity.details}</div>
                                                <div className={`${styles.impactBadge} ${styles[activity.impact]}`}>
                                                    {activity.impact.toUpperCase()} IMPACT
                                                </div>
                                            </div>
                                            <div className={`${styles.activityStatus} ${styles[activity.status]}`}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Launch Section */}
                            <div className={styles.section}>
                                <h2>Quick Launch</h2>
                                <div className={styles.quickLaunchGrid}>
                                    <button 
                                        className={styles.quickLaunchCard}
                                        onClick={() => setActiveView('test-tools')}
                                    >
                                        <div className={styles.launchIcon}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                                            </svg>
                                        </div>
                                        <div className={styles.launchContent}>
                                            <h3>Security Scan</h3>
                                            <p>Launch vulnerability assessment</p>
                                        </div>
                                        <div className={styles.launchBadge}>
                                            {securityTools.filter(t => t.status === 'available').length} tools ready
                                        </div>
                                    </button>

                                    <button 
                                        className={styles.quickLaunchCard}
                                        onClick={() => setActiveView('simulations')}
                                    >
                                        <div className={styles.launchIcon}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
                                            </svg>
                                        </div>
                                        <div className={styles.launchContent}>
                                            <h3>Attack Simulation</h3>
                                            <p>Start advanced threat simulation</p>
                                        </div>
                                        <div className={styles.launchBadge}>
                                            {simulations.filter(s => s.status === 'available').length} scenarios ready
                                        </div>
                                    </button>

                                    <button 
                                        className={styles.quickLaunchCard}
                                        onClick={() => startTrainingModel('advanced')}
                                    >
                                        <div className={styles.launchIcon}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="3"/>
                                                <path d="M12 1v6M12 17v6"/>
                                            </svg>
                                        </div>
                                        <div className={styles.launchContent}>
                                            <h3>AI Training</h3>
                                            <p>Train new threat detection model</p>
                                        </div>
                                        <div className={styles.launchBadge}>
                                            Advanced ML
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Test Tools View */}
                    {activeView === 'test-tools' && (
                        <div className={styles.testToolsPage}>
                            <div className={styles.pageHeader}>
                                <div className={styles.headerContent}>
                                    <h1>Security Testing Tools</h1>
                                    <p>Launch and manage comprehensive security assessments</p>
                                </div>
                                <div className={styles.headerActions}>
                                    <div className={styles.searchBox}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8"/>
                                            <path d="M21 21l-4.35-4.35"/>
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search tools..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.toolsGrid}>
                                {filteredTools.map(tool => (
                                    <div key={tool.id} className={`${styles.toolCard} ${styles[tool.status]}`}>
                                        <div className={styles.toolHeader}>
                                            <div className={styles.toolInfo}>
                                                <h3>{tool.name}</h3>
                                                <p>{tool.description}</p>
                                            </div>
                                            <div className={styles.toolMeta}>
                                                <span className={`${styles.statusBadge} ${getStatusBadgeClass(tool.status)}`}>
                                                    {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                                                </span>
                                                <span className={`${styles.complexityBadge} ${getDifficultyClass(tool.complexity)}`}>
                                                    {tool.complexity.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.toolDetails}>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Category:</span>
                                                <span className={styles.detailValue}>{tool.category}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Est. Time:</span>
                                                <span className={styles.detailValue}>{tool.estimatedTime}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Last Used:</span>
                                                <span className={styles.detailValue}>{tool.lastUsed}</span>
                                            </div>
                                        </div>

                                        {tool.status === 'running' && (
                                            <div className={styles.progressSection}>
                                                <div className={styles.progressHeader}>
                                                    <span>Progress: {tool.progress}%</span>
                                                </div>
                                                <div className={styles.progressBar}>
                                                    <div 
                                                        className={styles.progressFill}
                                                        style={{ width: `${tool.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {tool.status === 'completed' && tool.vulnerabilitiesFound > 0 && (
                                            <div className={styles.resultsSection}>
                                                <div className={styles.resultStat}>
                                                    <span className={styles.statValue}>{tool.vulnerabilitiesFound}</span>
                                                    <span className={styles.statLabel}>Vulnerabilities Found</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className={styles.toolActions}>
                                            {tool.status === 'available' && (
                                                <button 
                                                    className={styles.primaryButton}
                                                    onClick={() => runTool(tool.id)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polygon points="5,3 19,12 5,21 5,3"/>
                                                    </svg>
                                                    Start Scan
                                                </button>
                                            )}
                                            
                                            {(tool.status === 'running' || tool.status === 'completed') && (
                                                <button 
                                                    className={styles.secondaryButton}
                                                    onClick={() => setSelectedTool(tool)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                    {tool.status === 'running' ? 'View Logs' : 'View Report'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Simulations View */}
                    {activeView === 'simulations' && (
                        <div className={styles.simulationsPage}>
                            <div className={styles.pageHeader}>
                                <div className={styles.headerContent}>
                                    <h1>Attack Simulations</h1>
                                    <p>Run advanced threat scenarios to test your defenses</p>
                                </div>
                            </div>

                            <div className={styles.simulationsGrid}>
                                {simulations.map(simulation => (
                                    <div key={simulation.id} className={`${styles.simulationCard} ${styles[simulation.status]}`}>
                                        <div className={styles.cardHeader}>
                                            <h3>{simulation.name}</h3>
                                            <div className={styles.cardMeta}>
                                                <span className={`${styles.statusBadge} ${getStatusBadgeClass(simulation.status)}`}>
                                                    {simulation.status === 'running' ? 'Running' :
                                                     simulation.status === 'completed' ? 'Completed' : 'Ready'}
                                                </span>
                                                <span className={`${styles.difficultyBadge} ${getDifficultyClass(simulation.difficulty)}`}>
                                                    {simulation.difficulty.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className={styles.cardContent}>
                                            <p>{simulation.description}</p>
                                            <div className={styles.simulationMeta}>
                                                <div className={styles.metaItem}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10"/>
                                                        <polyline points="12,6 12,12 16,14"/>
                                                    </svg>
                                                    <span>{simulation.runtime}</span>
                                                </div>
                                                <div className={styles.metaItem}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                                    </svg>
                                                    <span>{simulation.currentPhase}</span>
                                                </div>
                                            </div>

                                            {simulation.status === 'running' && (
                                                <div className={styles.simulationProgress}>
                                                    <div className={styles.progressHeader}>
                                                        <span>Progress: {simulation.progress}%</span>
                                                        <span>Detection Rate: {simulation.detectionRate}%</span>
                                                    </div>
                                                    <div className={styles.progressBar}>
                                                        <div 
                                                            className={styles.progressFill}
                                                            style={{ width: `${simulation.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}

                                            {simulation.status === 'completed' && (
                                                <div className={styles.simulationResults}>
                                                    <div className={styles.resultItem}>
                                                        <span className={styles.resultLabel}>Detection Rate:</span>
                                                        <span className={styles.resultValue}>{simulation.detectionRate}%</span>
                                                    </div>
                                                    <div className={styles.resultItem}>
                                                        <span className={styles.resultLabel}>Attacks Blocked:</span>
                                                        <span className={styles.resultValue}>{simulation.attacksBlocked}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className={styles.cardActions}>
                                            {simulation.status === 'available' && (
                                                <button 
                                                    className={styles.primaryButton}
                                                    onClick={() => launchSimulation(simulation.id)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polygon points="5,3 19,12 5,21 5,3"/>
                                                    </svg>
                                                    Launch
                                                </button>
                                            )}
                                            {simulation.status === 'running' && (
                                                <button className={styles.secondaryButton}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                    View Progress
                                                </button>
                                            )}
                                            {simulation.status === 'completed' && (
                                                <button className={styles.secondaryButton}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                    </svg>
                                                    View Report
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Network Map View */}
                    {activeView === 'network-map' && (
                        <div className={styles.networkMapPage}>
                            <div className={styles.pageHeader}>
                                <div className={styles.headerContent}>
                                    <h1>Network Topology Map</h1>
                                    <p>Real-time network visualization and threat monitoring</p>
                                </div>
                                <div className={styles.headerActions}>
                                    <button className={styles.secondaryButton}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="23,4 23,10 17,10"/>
                                            <polyline points="1,20 1,14 7,14"/>
                                            <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"/>
                                        </svg>
                                        Refresh Topology
                                    </button>
                                </div>
                            </div>

                            <div className={styles.networkContainer}>
                                <div className={styles.networkLegend}>
                                    <h3>Network Status</h3>
                                    <div className={styles.legendItems}>
                                        <div className={styles.legendItem}>
                                            <div className={`${styles.legendDot} ${styles.healthy}`}></div>
                                            <span>Healthy ({networkNodes.filter(n => n.status === 'healthy').length})</span>
                                        </div>
                                        <div className={styles.legendItem}>
                                            <div className={`${styles.legendDot} ${styles.warning}`}></div>
                                            <span>Warning ({networkNodes.filter(n => n.status === 'warning').length})</span>
                                        </div>
                                        <div className={styles.legendItem}>
                                            <div className={`${styles.legendDot} ${styles.critical}`}></div>
                                            <span>Critical ({networkNodes.filter(n => n.status === 'critical').length})</span>
                                        </div>
                                        <div className={styles.legendItem}>
                                            <div className={`${styles.legendDot} ${styles.compromised}`}></div>
                                            <span>Compromised ({networkNodes.filter(n => n.status === 'compromised').length})</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.networkCanvas}>
                                    <div className={styles.networkNodes}>
                                        {networkNodes.map((node, index) => (
                                            <div
                                                key={node.id}
                                                className={`${styles.networkNode} ${styles[node.status]}`}
                                                style={{
                                                    left: `${20 + (index * 18) % 80}%`,
                                                    top: `${20 + (index * 15) % 60}%`
                                                }}
                                                onClick={() => handleNodeClick(node)}
                                            >
                                                <div className={styles.nodeIcon}>
                                                    {node.type === 'server' && (
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                                            <line x1="8" y1="21" x2="16" y2="21"/>
                                                            <line x1="12" y1="17" x2="12" y2="21"/>
                                                        </svg>
                                                    )}
                                                    {node.type === 'database' && (
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <ellipse cx="12" cy="5" rx="9" ry="3"/>
                                                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                                                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                                                        </svg>
                                                    )}
                                                    {node.type === 'workstation' && (
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                                            <line x1="8" y1="21" x2="16" y2="21"/>
                                                            <line x1="12" y1="17" x2="12" y2="21"/>
                                                        </svg>
                                                    )}
                                                    {node.type === 'router' && (
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="3"/>
                                                            <circle cx="12" cy="2" r="1"/>
                                                            <circle cx="12" cy="22" r="1"/>
                                                            <circle cx="20" cy="12" r="1"/>
                                                            <circle cx="4" cy="12" r="1"/>
                                                            <line x1="12" y1="15" x2="12" y2="21"/>
                                                            <line x1="12" y1="3" x2="12" y2="9"/>
                                                            <line x1="15" y1="12" x2="19" y2="12"/>
                                                            <line x1="5" y1="12" x2="9" y2="12"/>
                                                        </svg>
                                                    )}
                                                    {node.type === 'firewall' && (
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                                            <path d="M9 12l2 2 4-4"/>
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className={styles.nodeName}>{node.name}</div>
                                                <div className={styles.nodeStatus}>
                                                    {node.vulnerabilities > 0 && (
                                                        <span className={styles.vulnBadge}>{node.vulnerabilities}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Connection Lines */}
                                    <svg className={styles.connectionLines} viewBox="0 0 100 100" preserveAspectRatio="none">
                                        {networkConnections.map((conn, index) => {
                                            const sourceIndex = networkNodes.findIndex(n => n.id === conn.source);
                                            const targetIndex = networkNodes.findIndex(n => n.id === conn.target);
                                            const sourceX = 20 + (sourceIndex * 18) % 80;
                                            const sourceY = 20 + (sourceIndex * 15) % 60;
                                            const targetX = 20 + (targetIndex * 18) % 80;
                                            const targetY = 20 + (targetIndex * 15) % 60;

                                            return (
                                                <line
                                                    key={index}
                                                    x1={sourceX}
                                                    y1={sourceY}
                                                    x2={targetX}
                                                    y2={targetY}
                                                    className={`${styles.connectionLine} ${styles[conn.type]}`}
                                                    strokeWidth="0.2"
                                                />
                                            );
                                        })}
                                    </svg>
                                </div>

                                <div className={styles.networkStats}>
                                    <h3>Network Statistics</h3>
                                    <div className={styles.statsList}>
                                        <div className={styles.statItem}>
                                            <span className={styles.statLabel}>Total Nodes:</span>
                                            <span className={styles.statValue}>{networkNodes.length}</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statLabel}>Active Connections:</span>
                                            <span className={styles.statValue}>{networkConnections.length}</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statLabel}>Suspicious Traffic:</span>
                                            <span className={styles.statValue}>{networkConnections.filter(c => c.type === 'suspicious').length}</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statLabel}>Malicious Activity:</span>
                                            <span className={styles.statValue}>{networkConnections.filter(c => c.type === 'malicious').length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Training View */}
                    {activeView === 'model-training' && (
                        <div className={styles.modelTrainingPage}>
                            <div className={styles.pageHeader}>
                                <div className={styles.headerContent}>
                                    <h1>AI Model Training</h1>
                                    <p>Train and evaluate machine learning models for threat detection</p>
                                </div>
                                <div className={styles.headerActions}>
                                    <button 
                                        className={styles.primaryButton}
                                        onClick={() => startTrainingModel('custom')}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="8" x2="12" y2="16"/>
                                            <line x1="8" y1="12" x2="16" y2="12"/>
                                        </svg>
                                        Start New Training
                                    </button>
                                </div>
                            </div>

                            <div className={styles.trainingContainer}>
                                <div className={styles.trainingModelsGrid}>
                                    {trainingModels.map(model => (
                                        <div key={model.id} className={`${styles.modelCard} ${styles[model.stage]}`}>
                                            <div className={styles.modelHeader}>
                                                <div className={styles.modelInfo}>
                                                    <h3>{model.name}</h3>
                                                    <p>{model.dataset}</p>
                                                </div>
                                                <span className={`${styles.stageBadge} ${styles[model.stage]}`}>
                                                    {model.stage.toUpperCase()}
                                                </span>
                                            </div>

                                            {model.stage === 'train' && (
                                                <div className={styles.trainingProgress}>
                                                    <div className={styles.progressInfo}>
                                                        <div className={styles.progressItem}>
                                                            <span>Epochs: {model.epochsCompleted}/{model.totalEpochs}</span>
                                                        </div>
                                                        <div className={styles.progressItem}>
                                                            <span>Progress: {model.progress}%</span>
                                                        </div>
                                                    </div>
                                                    <div className={styles.progressBar}>
                                                        <div 
                                                            className={styles.progressFill}
                                                            style={{ width: `${model.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className={styles.modelMetrics}>
                                                <div className={styles.metricsGrid}>
                                                    <div className={styles.metricItem}>
                                                        <span className={styles.metricLabel}>Accuracy</span>
                                                        <span className={styles.metricValue}>
                                                            {model.stage === 'complete' ? `${model.accuracy.after.toFixed(1)}%` : 'Training...'}
                                                        </span>
                                                    </div>
                                                    <div className={styles.metricItem}>
                                                        <span className={styles.metricLabel}>Precision</span>
                                                        <span className={styles.metricValue}>
                                                            {model.stage === 'complete' ? `${model.metrics.precision.toFixed(1)}%` : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className={styles.metricItem}>
                                                        <span className={styles.metricLabel}>Recall</span>
                                                        <span className={styles.metricValue}>
                                                            {model.stage === 'complete' ? `${model.metrics.recall.toFixed(1)}%` : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className={styles.metricItem}>
                                                        <span className={styles.metricLabel}>F1 Score</span>
                                                        <span className={styles.metricValue}>
                                                            {model.stage === 'complete' ? `${model.metrics.f1Score.toFixed(1)}%` : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.modelDetails}>
                                                <div className={styles.detailsGrid}>
                                                    <div className={styles.detailItem}>
                                                        <span className={styles.detailLabel}>Data Points:</span>
                                                        <span className={styles.detailValue}>{model.dataPoints.toLocaleString()}</span>
                                                    </div>
                                                    <div className={styles.detailItem}>
                                                        <span className={styles.detailLabel}>Learning Rate:</span>
                                                        <span className={styles.detailValue}>{model.learningRate}</span>
                                                    </div>
                                                    <div className={styles.detailItem}>
                                                        <span className={styles.detailLabel}>Batch Size:</span>
                                                        <span className={styles.detailValue}>{model.batchSize}</span>
                                                    </div>
                                                    <div className={styles.detailItem}>
                                                        <span className={styles.detailLabel}>Training Time:</span>
                                                        <span className={styles.detailValue}>{model.trainingTime}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {model.stage === 'complete' && (
                                                <div className={styles.modelActions}>
                                                    <button className={styles.primaryButton}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                            <polyline points="7,10 12,15 17,10"/>
                                                            <line x1="12" y1="15" x2="12" y2="3"/>
                                                        </svg>
                                                        Deploy Model
                                                    </button>
                                                    <button className={styles.secondaryButton}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                        </svg>
                                                        View Report
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Alerts View */}
                    {activeView === 'alerts' && (
                        <div className={styles.alertsPage}>
                            <div className={styles.pageHeader}>
                                <div className={styles.headerContent}>
                                    <h1>Security Alerts</h1>
                                    <p>Monitor and respond to system security alerts</p>
                                </div>
                            </div>

                            <div className={styles.alertsContainer}>
                                {systemAlerts.map(alert => (
                                    <div key={alert.id} className={`${styles.alertCard} ${styles[alert.severity]} ${alert.acknowledged ? styles.acknowledged : ''}`}>
                                        <div className={styles.alertHeader}>
                                            <div className={styles.alertIcon}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                                </svg>
                                            </div>
                                            <div className={styles.alertInfo}>
                                                <h3>{alert.title}</h3>
                                                <p>{alert.message}</p>
                                            </div>
                                            <div className={styles.alertMeta}>
                                                <span className={`${styles.severityBadge} ${getSeverityClass(alert.severity)}`}>
                                                    {alert.severity.toUpperCase()}
                                                </span>
                                                <span className={styles.alertTime}>{alert.timestamp}</span>
                                            </div>
                                        </div>
                                        
                                        {!alert.acknowledged && (
                                            <div className={styles.alertActions}>
                                                <button 
                                                    className={styles.primaryButton}
                                                    onClick={() => acknowledgeAlert(alert.id)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="20,6 9,17 4,12"/>
                                                    </svg>
                                                    Acknowledge
                                                </button>
                                                {alert.actionRequired && (
                                                    <button className={styles.secondaryButton}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                                                        </svg>
                                                        Investigate
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reports View */}
                    {activeView === 'reports' && (
                        <div className={styles.reportsPage}>
                            <div className={styles.pageHeader}>
                                <div className={styles.headerContent}>
                                    <h1>Security Reports</h1>
                                    <p>Generate and manage comprehensive security reports</p>
                                </div>
                                <div className={styles.headerActions}>
                                    <button className={styles.primaryButton} onClick={generateReport}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            <polyline points="14,2 14,8 20,8"/>
                                            <line x1="16" y1="13" x2="8" y2="13"/>
                                            <line x1="16" y1="17" x2="8" y2="17"/>
                                        </svg>
                                        Generate New Report
                                    </button>
                                </div>
                            </div>

                            <div className={styles.reportsGrid}>
                                <div className={styles.reportCard}>
                                    <div className={styles.reportHeader}>
                                        <h3>Security Assessment Report</h3>
                                        <span className={styles.reportDate}>Generated: Today</span>
                                    </div>
                                    <div className={styles.reportContent}>
                                        <p>Comprehensive security assessment including vulnerability scans, penetration tests, and compliance checks.</p>
                                        <div className={styles.reportStats}>
                                            <div className={styles.stat}>
                                                <span className={styles.statValue}>47</span>
                                                <span className={styles.statLabel}>Vulnerabilities</span>
                                            </div>
                                            <div className={styles.stat}>
                                                <span className={styles.statValue}>12</span>
                                                <span className={styles.statLabel}>Critical</span>
                                            </div>
                                            <div className={styles.stat}>
                                                <span className={styles.statValue}>94%</span>
                                                <span className={styles.statLabel}>Coverage</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.reportActions}>
                                        <button className={styles.primaryButton}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                <polyline points="7,10 12,15 17,10"/>
                                                <line x1="12" y1="15" x2="12" y2="3"/>
                                            </svg>
                                            Download PDF
                                        </button>
                                        <button className={styles.secondaryButton}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                            View Online
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.reportCard}>
                                    <div className={styles.reportHeader}>
                                        <h3>Threat Intelligence Summary</h3>
                                        <span className={styles.reportDate}>Generated: Yesterday</span>
                                    </div>
                                    <div className={styles.reportContent}>
                                        <p>AI-generated threat intelligence report with predictive analytics and trend analysis.</p>
                                        <div className={styles.reportStats}>
                                            <div className={styles.stat}>
                                                <span className={styles.statValue}>156</span>
                                                <span className={styles.statLabel}>Threats Blocked</span>
                                            </div>
                                            <div className={styles.stat}>
                                                <span className={styles.statValue}>96.8%</span>
                                                <span className={styles.statLabel}>Detection Rate</span>
                                            </div>
                                            <div className={styles.stat}>
                                                <span className={styles.statValue}>23</span>
                                                <span className={styles.statLabel}>ML Models</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.reportActions}>
                                        <button className={styles.primaryButton}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                <polyline points="7,10 12,15 17,10"/>
                                                <line x1="12" y1="15" x2="12" y2="3"/>
                                            </svg>
                                            Download PDF
                                        </button>
                                        <button className={styles.secondaryButton}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                            View Online
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Node Details Modal */}
            {selectedNode && (
                <div className={styles.modalOverlay} onClick={() => setSelectedNode(null)}>
                    <div className={styles.nodeModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{selectedNode.name}</h2>
                            <button onClick={() => setSelectedNode(null)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.nodeDetailsGrid}>
                                <div className={styles.nodeDetailSection}>
                                    <h3>System Information</h3>
                                    <div className={styles.nodeDetailsList}>
                                        <div className={styles.nodeDetailItem}>
                                            <span className={styles.detailLabel}>Type:</span>
                                            <span className={styles.detailValue}>{selectedNode.type}</span>
                                        </div>
                                        <div className={styles.nodeDetailItem}>
                                            <span className={styles.detailLabel}>Status:</span>
                                            <span className={`${styles.detailValue} ${styles[selectedNode.status]}`}>
                                                {selectedNode.status.charAt(0).toUpperCase() + selectedNode.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className={styles.nodeDetailItem}>
                                            <span className={styles.detailLabel}>Last Seen:</span>
                                            <span className={styles.detailValue}>{selectedNode.lastSeen}</span>
                                        </div>
                                        <div className={styles.nodeDetailItem}>
                                            <span className={styles.detailLabel}>Vulnerabilities:</span>
                                            <span className={`${styles.detailValue} ${selectedNode.vulnerabilities > 0 ? styles.warning : ''}`}>
                                                {selectedNode.vulnerabilities}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.nodeDetailSection}>
                                    <h3>Performance Metrics</h3>
                                    <div className={styles.metricsGrid}>
                                        <div className={styles.metricCard}>
                                            <div className={styles.metricHeader}>
                                                <span className={styles.metricLabel}>CPU Usage</span>
                                                <span className={styles.metricValue}>{selectedNode.cpuUsage}%</span>
                                            </div>
                                            <div className={styles.metricBar}>
                                                <div 
                                                    className={styles.metricFill}
                                                    style={{ 
                                                        width: `${selectedNode.cpuUsage}%`,
                                                        backgroundColor: (selectedNode.cpuUsage || 0) > 80 ? '#ef4444' : (selectedNode.cpuUsage || 0) > 60 ? '#f59e0b' : '#10b981'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className={styles.metricCard}>
                                            <div className={styles.metricHeader}>
                                                <span className={styles.metricLabel}>Memory Usage</span>
                                                <span className={styles.metricValue}>{selectedNode.memoryUsage}%</span>
                                            </div>
                                            <div className={styles.metricBar}>
                                                <div 
                                                    className={styles.metricFill}
                                                    style={{ 
                                                        width: `${selectedNode.memoryUsage}%`,
                                                        backgroundColor: (selectedNode.memoryUsage || 0) > 80 ? '#ef4444' : (selectedNode.memoryUsage || 0) > 60 ? '#f59e0b' : '#10b981'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className={styles.metricCard}>
                                            <div className={styles.metricHeader}>
                                                <span className={styles.metricLabel}>Disk Usage</span>
                                                <span className={styles.metricValue}>{selectedNode.diskUsage}%</span>
                                            </div>
                                            <div className={styles.metricBar}>
                                                <div 
                                                    className={styles.metricFill}
                                                    style={{ 
                                                        width: `${selectedNode.diskUsage}%`,
                                                        backgroundColor: (selectedNode.diskUsage || 0) > 80 ? '#ef4444' : (selectedNode.diskUsage || 0) > 60 ? '#f59e0b' : '#10b981'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className={styles.metricCard}>
                                            <div className={styles.metricHeader}>
                                                <span className={styles.metricLabel}>Network Traffic</span>
                                                <span className={styles.metricValue}>{selectedNode.networkTraffic} MB/s</span>
                                            </div>
                                            <div className={styles.metricBar}>
                                                <div 
                                                    className={styles.metricFill}
                                                    style={{ 
                                                        width: `${Math.min((selectedNode.networkTraffic || 0) / 10, 100)}%`,
                                                        backgroundColor: '#3b82f6'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.nodeDetailSection}>
                                    <h3>Connections ({selectedNode.connections.length})</h3>
                                    <div className={styles.connectionsList}>
                                        {selectedNode.connections.map(connId => {
                                            const connectedNode = networkNodes.find(n => n.id === connId);
                                            return connectedNode ? (
                                                <div key={connId} className={styles.connectionItem}>
                                                    <div className={styles.connectionIcon}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <line x1="17" y1="7" x2="7" y2="17"/>
                                                            <polyline points="17,17 17,7 7,7"/>
                                                        </svg>
                                                    </div>
                                                    <span>{connectedNode.name}</span>
                                                    <span className={`${styles.connectionStatus} ${styles[connectedNode.status]}`}>
                                                        {connectedNode.status}
                                                    </span>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            {selectedNode.status === 'compromised' && (
                                <button 
                                    className={styles.dangerButton}
                                    onClick={() => isolateNode(selectedNode.id)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="3"/>
                                        <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                                    </svg>
                                    Isolate Node
                                </button>
                            )}
                            <button className={styles.secondaryButton}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14,2 14,8 20,8"/>
                                </svg>
                                Generate Report
                            </button>
                            <button 
                                className={styles.primaryButton}
                                onClick={() => setSelectedNode(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tool Details Modal */}
            {selectedTool && (
                <div className={styles.modalOverlay} onClick={() => setSelectedTool(null)}>
                    <div className={styles.toolModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{selectedTool.name}</h2>
                            <button onClick={() => setSelectedTool(null)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.toolDetailsHeader}>
                                <div className={styles.toolDetailsMeta}>
                                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(selectedTool.status)}`}>
                                        {selectedTool.status.charAt(0).toUpperCase() + selectedTool.status.slice(1)}
                                    </span>
                                    <span className={styles.toolCategory}>{selectedTool.category}</span>
                                    {selectedTool.status === 'running' && (
                                        <span className={styles.toolProgress}>Progress: {selectedTool.progress}%</span>
                                    )}
                                </div>
                                <p className={styles.toolDescription}>{selectedTool.description}</p>
                            </div>

                            {selectedTool.status === 'running' && (
                                <div className={styles.progressSection}>
                                    <div className={styles.progressBar}>
                                        <div 
                                            className={styles.progressFill}
                                            style={{ width: `${selectedTool.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className={styles.logsContainer} ref={logContainerRef}>
                                <h3>Execution Logs</h3>
                                <div className={styles.logsContent}>
                                    {selectedTool.logs.map(log => (
                                        <div key={log.id} className={`${styles.logEntry} ${styles[log.level]}`}>
                                            <div className={styles.logHeader}>
                                                <span className={styles.logTime}>{log.timestamp}</span>
                                                <span className={`${styles.logLevel} ${styles[log.level]}`}>
                                                    {log.level.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className={styles.logMessage}>{log.message}</div>
                                            {log.details && (
                                                <div className={styles.logDetails}>{log.details}</div>
                                            )}
                                        </div>
                                    ))}
                                    {selectedTool.logs.length === 0 && (
                                        <div className={styles.noLogs}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <line x1="12" y1="8" x2="12" y2="12"/>
                                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </svg>
                                            <p>No logs available yet. Start the tool to see execution logs.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedTool.status === 'completed' && selectedTool.vulnerabilitiesFound > 0 && (
                                <div className={styles.resultsSection}>
                                    <h3>Scan Results</h3>
                                    <div className={styles.resultsGrid}>
                                        <div className={styles.resultCard}>
                                            <div className={styles.resultIcon}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                                </svg>
                                            </div>
                                            <div className={styles.resultInfo}>
                                                <span className={styles.resultValue}>{selectedTool.vulnerabilitiesFound}</span>
                                                <span className={styles.resultLabel}>Vulnerabilities Found</span>
                                            </div>
                                        </div>
                                        <div className={styles.resultCard}>
                                            <div className={styles.resultIcon}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                                </svg>
                                            </div>
                                            <div className={styles.resultInfo}>
                                                <span className={styles.resultValue}>{Math.floor(Math.random() * 5) + 1}</span>
                                                <span className={styles.resultLabel}>Critical Risks</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.modalActions}>
                            {selectedTool.status === 'available' && (
                                <button 
                                    className={styles.primaryButton}
                                    onClick={() => runTool(selectedTool.id)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="5,3 19,12 5,21 5,3"/>
                                    </svg>
                                    Start Tool
                                </button>
                            )}
                            {selectedTool.status === 'completed' && (
                                <button className={styles.exportButton} onClick={exportLogs}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="7,10 12,15 17,10"/>
                                        <line x1="12" y1="15" x2="12" y2="3"/>
                                    </svg>
                                    Export Results
                                </button>
                            )}
                            <button 
                                className={styles.secondaryButton}
                                onClick={() => setSelectedTool(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Confirmation Modal */}
            {showConfirmModal && (
                <div className={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                            </div>
                            <h3>Reset Security Environment</h3>
                        </div>
                        <div className={styles.modalContent}>
                            <p>This action will completely reset your security testing environment:</p>
                            <ul>
                                <li>Stop all running security tests and simulations</li>
                                <li>Clear all execution logs and training data</li>
                                <li>Reset system metrics and security alerts</li>
                                <li>Return all tools to their initial state</li>
                                <li>Clear network topology and connections</li>
                            </ul>
                            <div className={styles.warningBox}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                <div>
                                    <strong>Warning:</strong> This action cannot be undone. All current progress and data will be permanently lost.
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button 
                                className={styles.secondaryButton}
                                onClick={() => setShowConfirmModal(false)}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                                Cancel
                            </button>
                            <button 
                                className={styles.dangerButton}
                                onClick={confirmReset}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23,4 23,10 17,10"/>
                                    <polyline points="1,20 1,14 7,14"/>
                                    <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"/>
                                </svg>
                                Reset Environment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
