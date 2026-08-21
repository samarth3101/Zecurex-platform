'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.scss';

interface LoginData {
  username: string;
  password: string;
  privateKey: string;
}

export default function ZecureLogin() {
  const router = useRouter();
  const [loginData, setLoginData] = useState<LoginData>({
    username: '',
    password: '',
    privateKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    if (loginData.username && loginData.password && loginData.privateKey) {
      router.push('/?view=dashboard');
    } else {
      setIsLoading(false);
    }
  }, [loginData, router]);

  return (
    <div className={styles.container}>
      
      {/* Central Grid Background with Radial Fade */}
      <div className={styles.backgroundGrid}>
        <div className={styles.gridOverlay}>
          {/* Security Icons Grid */}
          <div className={styles.iconGrid}>
            <div className={styles.icon} style={{left: '20%', top: '15%'}}>🔒</div>
            <div className={styles.icon} style={{left: '45%', top: '12%'}}>🛡️</div>
            <div className={styles.icon} style={{left: '70%', top: '18%'}}>🔐</div>
            <div className={styles.icon} style={{left: '15%', top: '35%'}}>🔑</div>
            <div className={styles.icon} style={{left: '55%', top: '30%'}}>⚡</div>
            <div className={styles.icon} style={{left: '80%', top: '40%'}}>🚀</div>
            <div className={styles.icon} style={{left: '25%', top: '55%'}}>💻</div>
            <div className={styles.icon} style={{left: '65%', top: '60%'}}>📊</div>
            <div className={styles.icon} style={{left: '40%', top: '70%'}}>☁️</div>
            <div className={styles.icon} style={{left: '10%', top: '75%'}}>🎯</div>
            <div className={styles.icon} style={{left: '85%', top: '70%'}}>🔍</div>
            <div className={styles.icon} style={{left: '30%', top: '85%'}}>📡</div>
          </div>
        </div>
      </div>

      {/* Left Panel */}
      <div className={styles.brand}>
        <div className={styles.brandContent}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <span className={styles.logoType}>
              <span className={styles.accent}>Zecure</span> ONE
            </span>
          </div>
          
          <div className={styles.welcome}>
            <h1>Welcome back buddy</h1>
            <p>Zecure's own Auth platform is here to protect you</p>
          </div>

          <div className={styles.perks}>
            <div className={styles.perk}>
              <div className={styles.perkIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c.552 0 1-.448 1-1V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6c0 .552.448 1 1 1"/>
                </svg>
              </div>
              <span>AI-Powered Threat Detection</span>
            </div>
            
            <div className={styles.perk}>
              <div className={styles.perkIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <span>Real-Time Monitoring</span>
            </div>
            
            <div className={styles.perk}>
              <div className={styles.perkIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                </svg>
              </div>
              <span>Cloud-Native Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.auth}>
        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={`${styles.field} ${focused === 'username' ? styles.active : ''}`}>
            <label className={loginData.username ? styles.up : ''}>USERNAME</label>
            <input
              type="text"
              name="username"
              value={loginData.username}
              onChange={handleChange}
              onFocus={() => setFocused('username')}
              onBlur={() => setFocused(null)}
              disabled={isLoading}
            />
          </div>

          <div className={`${styles.field} ${focused === 'password' ? styles.active : ''}`}>
            <label className={loginData.password ? styles.up : ''}>PASSWORD</label>
            <div className={styles.inputRow}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={loginData.password}
                onChange={handleChange}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className={styles.toggle}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {showPassword ? (
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  ) : (
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  )}
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <div className={`${styles.field} ${focused === 'privateKey' ? styles.active : ''}`}>
            <label className={loginData.privateKey ? styles.up : ''}>PRIVATE KEY</label>
            <div className={styles.inputRow}>
              <input
                type={showPrivateKey ? 'text' : 'password'}
                name="privateKey"
                value={loginData.privateKey}
                onChange={handleChange}
                onFocus={() => setFocused('privateKey')}
                onBlur={() => setFocused(null)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                disabled={isLoading}
                className={styles.toggle}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className={styles.submit}>
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                Authenticating...
              </>
            ) : (
              <>
                Access Dashboard
                <span className={styles.arrow}>→</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
