'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './compliance-audit.module.scss';

interface ComplianceReport {
    id: string;
    title: string;
    type: 'SOC2' | 'GDPR' | 'HIPAA' | 'PCI_DSS' | 'ISO27001';
    status: 'compliant' | 'non_compliant' | 'pending' | 'review_needed';
    score: number;
    lastUpdated: string;
    issues: number;
    recommendations: number;
}

interface AuditLog {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    resource: string;
    outcome: 'success' | 'failure' | 'warning';
}

export default function ComplianceAudit() {
    const router = useRouter();
    const [reports, setReports] = useState<ComplianceReport[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        // Check access permissions
        const masterMode = localStorage.getItem('zecure-master-mode') === 'true';
        if (!masterMode) {
            router.push('/dashboard');
            return;
        }
        setHasAccess(true);

        // Mock data
        setReports([
            {
                id: 'RPT-001',
                title: 'SOC 2 Type II Compliance',
                type: 'SOC2',
                status: 'compliant',
                score: 98.5,
                lastUpdated: '2 days ago',
                issues: 0,
                recommendations: 3
            },
            {
                id: 'RPT-002',
                title: 'GDPR Data Protection Assessment',
                type: 'GDPR',
                status: 'review_needed',
                score: 89.2,
                lastUpdated: '1 week ago',
                issues: 2,
                recommendations: 5
            },
            {
                id: 'RPT-003',
                title: 'ISO 27001 Security Framework',
                type: 'ISO27001',
                status: 'compliant',
                score: 95.8,
                lastUpdated: '3 days ago',
                issues: 1,
                recommendations: 2
            }
        ]);

        setAuditLogs([
            {
                id: 'LOG-001',
                action: 'User access granted',
                user: 'admin@company.com',
                timestamp: '2m ago',
                resource: 'Financial Reports',
                outcome: 'success'
            },
            {
                id: 'LOG-002',
                action: 'Failed login attempt',
                user: 'unknown@external.com',
                timestamp: '15m ago',
                resource: 'Admin Panel',
                outcome: 'failure'
            },
            {
                id: 'LOG-003',
                action: 'Data export',
                user: 'analyst@company.com',
                timestamp: '1h ago',
                resource: 'Customer Database',
                outcome: 'warning'
            }
        ]);
    }, [router]);

    if (!hasAccess) {
        return null;
    }

    return (
        <div className={styles.compliancePage}>
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

                <div className={styles.headerInfo}>
                    <h1>
                        Compliance & Audit Reports
                        <span className={styles.premiumBadge}>PREMIUM</span>
                    </h1>
                    <p>Comprehensive compliance monitoring and audit trail management</p>
                </div>
            </header>

            <div className={styles.complianceOverview}>
                <div className={styles.overallScore}>
                    <div className={styles.scoreValue}>99.1%</div>
                    <div className={styles.scoreLabel}>Overall Compliance</div>
                    <div className={styles.scoreIndicator}>
                        <div className={styles.scoreBar} style={{ width: '99.1%' }}></div>
                    </div>
                </div>
                <div className={styles.complianceStats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>5</span>
                        <span className={styles.statLabel}>Active Frameworks</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>3</span>
                        <span className={styles.statLabel}>Open Issues</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>12</span>
                        <span className={styles.statLabel}>Pending Reviews</span>
                    </div>
                </div>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.reportsSection}>
                    <h3>Compliance Reports</h3>
                    <div className={styles.reportsList}>
                        {reports.map(report => (
                            <div key={report.id} className={`${styles.reportCard} ${styles[report.status]}`}>
                                <div className={styles.reportHeader}>
                                    <h4>{report.title}</h4>
                                    <span className={styles.reportType}>{report.type}</span>
                                </div>
                                <div className={styles.reportMetrics}>
                                    <div className={styles.scoreSection}>
                                        <div className={styles.score}>{report.score}%</div>
                                        <div className={styles.scoreLabel}>Compliance Score</div>
                                    </div>
                                    <div className={styles.issuesSection}>
                                        <div className={styles.issues}>
                                            <span className={styles.issueCount}>{report.issues}</span> Issues
                                        </div>
                                        <div className={styles.recommendations}>
                                            <span className={styles.recCount}>{report.recommendations}</span> Recommendations
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.reportFooter}>
                                    <span className={styles.lastUpdated}>Updated {report.lastUpdated}</span>
                                    <div className={`${styles.reportStatus} ${styles[report.status]}`}>
                                        {report.status.replace('_', ' ').toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.auditSection}>
                    <h3>Audit Trail</h3>
                    <div className={styles.auditLogs}>
                        {auditLogs.map(log => (
                            <div key={log.id} className={`${styles.auditLog} ${styles[log.outcome]}`}>
                                <div className={styles.logHeader}>
                                    <span className={styles.logAction}>{log.action}</span>
                                    <span className={styles.logTime}>{log.timestamp}</span>
                                </div>
                                <div className={styles.logDetails}>
                                    <span className={styles.logUser}>👤 {log.user}</span>
                                    <span className={styles.logResource}>📄 {log.resource}</span>
                                </div>
                                <div className={`${styles.logOutcome} ${styles[log.outcome]}`}>
                                    {log.outcome.toUpperCase()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.actionButtons}>
                <button className={styles.generateBtn}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                    </svg>
                    Generate Report
                </button>
                <button className={styles.exportBtn}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7,10 12,15 17,10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export Data
                </button>
            </div>
        </div>
    );
}
