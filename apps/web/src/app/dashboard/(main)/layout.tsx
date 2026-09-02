'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CreditCard, 
  Sparkles, 
  BarChart3, 
  History, 
  Sliders, 
  LogOut, 
  Play, 
  ShieldCheck, 
  Database,
  Server,
  UserCheck
} from 'lucide-react';
import { ZecureAPI } from '@/lib/api';
import SimulationModal from '../components/SimulationModal';
import JudgeHudModal from '../components/JudgeHudModal';
import styles from './layout.module.scss';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await ZecureAPI.logout();
    } catch {
      // Clear client state even on error
    } finally {
      if (typeof document !== 'undefined') {
        document.cookie = 'zecure_admin_token=; path=/; max-age=0; SameSite=Lax; Secure';
      }
      router.push('/dashboard/login');
    }
  };

  const handleSimulationComplete = (transactionId: string) => {
    // If currently on dashboard, we can refresh or dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zecure:simulation_created', { detail: { transactionId } }));
    }
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
    { name: 'Investigations', href: '/dashboard/investigations', icon: Sparkles },
    { name: 'Model Performance', href: '/dashboard/performance', icon: BarChart3 },
    { name: 'Audit Trail', href: '/dashboard/audit', icon: History },
    { name: 'Settings', href: '/dashboard/settings', icon: Sliders },
  ];

  // Helper to get active header title
  const getSectionInfo = () => {
    if (pathname === '/dashboard') return { title: 'Risk Intelligence Overview', sub: 'Real-time payment behavior & risk intelligence' };
    if (pathname?.includes('/transactions')) return { title: 'Transaction Operations Explorer', sub: 'Inspect point-in-time payment telemetry and raw features' };
    if (pathname?.includes('/investigations')) return { title: 'AI Investigation Queue', sub: 'Review Gemini agent grounded reasoning and bounded recommendations' };
    if (pathname?.includes('/performance')) return { title: 'Synthetic Held-Out Evaluation', sub: 'Benchmark telemetry and Random Forest evaluation metrics' };
    if (pathname?.includes('/audit')) return { title: 'Auditable Event Explorer', sub: 'Complete provenance trail and actor state transitions' };
    if (pathname?.includes('/settings')) return { title: 'Control Room Settings & Diagnostics', sub: 'Engine thresholds, agent providers, and telemetry configuration' };
    return { title: 'Control Room', sub: 'Zecure AI Risk Manager' };
  };

  const sectionInfo = getSectionInfo();

  return (
    <div className={styles.layoutRoot}>
      {/* Simulation Modal */}
      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onSimulationComplete={handleSimulationComplete}
      />

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Brand */}
        <div className={styles.brandArea}>
          <Link href="/" className={styles.brandLink}>
            <span className={styles.brandLogo}>ZECURE</span>
            <span className={styles.brandTag}>CONTROL ROOM</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          <div className={styles.navGroup}>
            <span className={styles.navGroupTitle}>OPERATIONS</span>
            {navItems.slice(0, 3).map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  <Icon size={15} className={styles.navIcon} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className={styles.navGroup}>
            <span className={styles.navGroupTitle}>INTELLIGENCE & GOVERNANCE</span>
            {navItems.slice(3).map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  <Icon size={15} className={styles.navIcon} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom System Status */}
        <div className={styles.systemStatusBlock}>
          <div className={styles.statusRow}>
            <div className={styles.statusLeft}>
              <Server size={11} className={styles.statusIcon} />
              <span>Core Engine</span>
            </div>
            <span className={styles.statusOk}>● Operational</span>
          </div>

          <div className={styles.statusRow}>
            <div className={styles.statusLeft}>
              <Database size={11} className={styles.statusIcon} />
              <span>PostgreSQL</span>
            </div>
            <span className={styles.statusOk}>● Connected</span>
          </div>

          <div className={styles.statusRow}>
            <div className={styles.statusLeft}>
              <ShieldCheck size={11} className={styles.statusIcon} />
              <span>Environment</span>
            </div>
            <span className={styles.envTag}>LIVE DEMO</span>
          </div>

          {/* User Sign Out */}
          <div className={styles.userFooter}>
            <div className={styles.userInfo}>
              <UserCheck size={13} className={styles.userIcon} />
              <span className={styles.userName}>Risk Operator</span>
            </div>
            <button className={styles.signOutBtn} onClick={handleLogout} title="Sign Out">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Intelligence Workspace */}
      <div className={styles.mainWorkspace}>
        {/* Top Command Bar */}
        <header className={styles.commandHeader}>
          <div className={styles.commandLeft}>
            <h1 className={styles.sectionTitle}>{sectionInfo.title}</h1>
            <span className={styles.sectionSub}>{sectionInfo.sub}</span>
          </div>

          <div className={styles.commandRight}>
            <div className={styles.healthPill}>
              <span className={styles.healthDot} />
              <span className={styles.healthText}>System Operational</span>
            </div>

            <div className={styles.envBadge}>
              LIVE PIPELINE
            </div>

            <button 
              className={styles.simulateBtn} 
              onClick={() => setIsSimModalOpen(true)}
              title="Simulate Payment through Pipeline"
            >
              <Play size={13} />
              <span>Simulate Payment</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>

      {/* Razorpay Buildathon Evaluator HUD */}
      <JudgeHudModal onOpenSimulation={() => setIsSimModalOpen(true)} />
    </div>
  );
}
