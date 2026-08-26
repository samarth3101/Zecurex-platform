/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZecureAPI } from '@/lib/api';
import styles from './login.module.scss';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // In a real app we'd send username/password/privateKey.
      // For this hackathon demo, we send the password as the passcode for the backend.
      // If they type 'dev2024' in the password field, it will work.
      // We will default to dev2024 if they click Google.
      const passcode = password || 'dev2024';
      await ZecureAPI.login(passcode);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Demo mock: instantly logs them in as the hackathon admin
    handleLogin();
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>Zecure Control Room</h1>
          <p>Authentication Required</p>
        </div>
        
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Username</label>
            <input 
              type="text" 
              placeholder="admin@zecure.one"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter password (hint: dev2024)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Private Key</label>
            <textarea 
              placeholder="-----BEGIN PRIVATE KEY-----"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className={`${styles.input} ${styles.textarea}`}
              rows={3}
            />
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <button 
          type="button" 
          disabled={loading} 
          onClick={handleGoogleLogin}
          className={styles.googleButton}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
