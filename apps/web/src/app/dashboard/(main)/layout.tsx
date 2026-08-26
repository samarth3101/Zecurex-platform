'use client';

import React from 'react';
import styles from './layout.module.scss';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ZecureAPI } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await ZecureAPI.logout();
    } catch {
      // Even if the backend call fails, clear the client state and redirect
    } finally {
      router.push('/dashboard/login');
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <h1>Zecure<span>ONE</span></h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>Control Room</Link>
          <Link href="/dashboard/performance" className={styles.navLink}>Model Performance</Link>
          <button className={styles.navLink} onClick={handleLogout}>Sign Out</button>
        </nav>
      </aside>
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h2>Zecure Control Room</h2>
            <span className={styles.environment}>Environment: <strong>Live Demo</strong></span>
          </div>
        </header>
        
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
