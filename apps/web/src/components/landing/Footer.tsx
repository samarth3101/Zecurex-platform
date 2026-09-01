'use client';

import { useState } from 'react';
import Link from 'next/link';
import Lottie from 'lottie-react';
import monitorAnimation from '../../../public/lottie-footer.json';
import styles from '@/styles/components/Footer.module.scss';

const LINKS = [
  { name: 'Documentation',    href: '/docs',    icon: 'docs'    },
  { name: 'Contact',          href: '/contact', icon: 'contact' },
  { name: 'Privacy Policy',   href: '/privacy', icon: 'privacy' },
  { name: 'Terms of Service', href: '/terms',   icon: 'terms'   },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'docs': return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    );
    case 'contact': return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    );
    case 'privacy': return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <circle cx="12" cy="16" r="1"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    );
    case 'terms': return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    );
    default: return null;
  }
};

export default function Footer() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <footer className={styles.footer}>

      {/* thin top accent line */}
      <div className={styles.accentLine} aria-hidden="true" />

      <div className={styles.container}>

        {/* ── MAIN ROW: brand · lottie · links ── */}
        <div className={styles.mainRow}>

          {/* LEFT — Brand */}
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <span className={styles.logoText}>
                <span className={styles.brandName}>Zecure</span>
                <span className={styles.brandSuffix}>ONE</span>
              </span>
            </div>
            <p className={styles.brandDescription}>
              AI-native payment risk intelligence for modern merchants.
            </p>
          </div>

          {/* CENTRE — Lottie */}
          <div className={styles.lottieCol} aria-hidden="true">
            <Lottie
              animationData={monitorAnimation}
              loop
              autoplay
              className={styles.lottieAnim}
            />
          </div>

          {/* RIGHT — 2×2 link grid */}
          <div className={styles.linksCol}>
            <div className={styles.linksGrid}>
              {LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`${styles.footerLink} ${hoveredLink === link.name ? styles.hovered : ''}`}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <span className={styles.linkIcon}>{getIcon(link.icon)}</span>
                  <span className={styles.linkText}>{link.name}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* ── DIVIDER ── */}
        <div className={styles.divider} />

        {/* ── BOTTOM ROW ── */}
        <div className={styles.bottomRow}>
          <div className={styles.copyright}>
            © 2026 <span className={styles.copyrightBrand}>Zecure ONE</span> · All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
