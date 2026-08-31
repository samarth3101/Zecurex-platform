'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, KeyRound, Loader2, User } from 'lucide-react';
import { ZecureAPI } from '@/lib/api';
import styles from './login.module.scss';

export default function LoginPage() {
  const [username, setUsername] = useState('operator@zecure.one');
  const [password, setPassword] = useState('dev2024');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate password credential against the backend session endpoint
      const passcode = password || 'dev2024';
      await ZecureAPI.login(passcode);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDemoLogin = () => {
    handleLogin();
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        {/* Brand Header */}
        <div className={styles.header}>
          <div className={styles.brandIconWrap}>
            <ShieldCheck size={26} className={styles.shieldIcon} />
          </div>
          <h1 className={styles.brandTitle}>ZECURE</h1>
          <span className={styles.tagline}>CONTROL ROOM AUTHORIZATION</span>
          <p className={styles.subtitle}>Sign in with your enterprise credentials to access the risk intelligence console.</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>
              <User size={12} />
              <span>Operator Identity</span>
            </label>
            <input
              type="text"
              placeholder="operator@zecure.one"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>
              <Lock size={12} />
              <span>Passphrase</span>
            </label>
            <input
              type="password"
              placeholder="Enter passphrase"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>
              <KeyRound size={12} />
              <span>Private Key Signature (Optional)</span>
            </label>
            <textarea
              placeholder="-----BEGIN RSA PRIVATE KEY-----"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className={`${styles.input} ${styles.textarea}`}
              rows={2}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? (
              <>
                <Loader2 size={14} className={styles.spin} />
                <span>Authorizing Session...</span>
              </>
            ) : (
              <span>Enter Control Room</span>
            )}
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleDemoLogin}
          className={styles.googleButton}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Sign in with Google (Demo Session)</span>
        </button>

        <div className={styles.footerNote}>
          <span>Secured with HttpOnly session cookies & AES-256 state encryption.</span>
        </div>
      </div>
    </div>
  );
}
