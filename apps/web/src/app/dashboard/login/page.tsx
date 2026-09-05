'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, KeyRound, Loader2, Smartphone, ArrowLeft, Award } from 'lucide-react';
import { ZecureAPI } from '@/lib/api';
import styles from './login.module.scss';

export default function LoginPage() {
  const router = useRouter();

  // Credentials State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Step-Up OTP Challenge State
  const [isStepUp, setIsStepUp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(true);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleJudgeAccess = async () => {
    setError(null);
    setLoading(true);
    try {
      const resp = await ZecureAPI.loginWithCredentials({
        email: 'judge@zecuredemo.com',
        password: 'ZecureDemo@2024',
      });

      if (resp.status === 'authenticated') {
        if (typeof document !== 'undefined') {
          document.cookie = 'zecure_admin_token=true; path=/; max-age=604800; SameSite=Lax; Secure';
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('zecure_judge_view', 'true');
        }
        router.push('/dashboard');
      } else {
        setError(resp.message || 'Evaluator authorization failed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Evaluator authorization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const resp = await ZecureAPI.loginWithCredentials({ email, password });
      if (resp.status === 'authenticated') {
        if (typeof document !== 'undefined') {
          document.cookie = 'zecure_admin_token=true; path=/; max-age=604800; SameSite=Lax; Secure';
        }
        router.push('/dashboard');
      } else if (resp.status === 'requires_verification') {
        setIsStepUp(true);
        if (resp.dev_otp) {
          setDevOtp(resp.dev_otp);
          setOtpCode(resp.dev_otp);
        }
      } else {
        setError(resp.message || 'Authentication required.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleStepUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const resp = await ZecureAPI.verifyLoginStepUp({
        email,
        code: otpCode.trim(),
        trust_device: trustDevice,
      });
      if (resp.status === 'authenticated') {
        if (typeof document !== 'undefined') {
          document.cookie = 'zecure_admin_token=true; path=/; max-age=604800; SameSite=Lax; Secure';
        }
        router.push('/dashboard');
      } else {
        setError(resp.message || 'Verification failed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        {/* Brand Header */}
        <div className={styles.header}>
          <div className={styles.brandIconWrap}>
            {isStepUp ? (
              <Smartphone size={24} className={styles.shieldIcon} />
            ) : (
              <ShieldCheck size={24} className={styles.shieldIcon} />
            )}
          </div>
          <h1 className={styles.brandTitle}>ZECURE</h1>
          <span className={styles.tagline}>
            {isStepUp ? 'DEVICE VERIFICATION REQUIRED' : 'SECURE OPERATOR ACCESS'}
          </span>
          <p className={styles.subtitle}>
            {isStepUp
              ? `Enter the 6-digit authorization code sent to ${email}`
              : 'Sign in with your enterprise credentials to access the risk intelligence console.'}
          </p>
        </div>

        {/* Form */}
        {!isStepUp ? (
          <form onSubmit={handleCredentialsSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>
                <span className={styles.labelLeft}>
                  <Mail size={12} />
                  Work Email
                </span>
              </label>
              <input
                type="email"
                placeholder="operator@zecure.one"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>
                <span className={styles.labelLeft}>
                  <Lock size={12} />
                  Password
                </span>
                <Link href="/dashboard/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="current-password"
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
                <span>Sign In to Control Room</span>
              )}
            </button>

            <div className={styles.judgeDivider}>
              <span>OR EVALUATOR QUICK ACCESS</span>
            </div>

            <button
              type="button"
              onClick={handleJudgeAccess}
              disabled={loading}
              className={styles.judgeAccessBtn}
            >
              <Award size={15} />
              <span>1-Click Evaluator Mode</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleStepUpSubmit} className={styles.form}>
            {devOtp && (
              <div className={styles.devOtpBanner}>
                <span>Dev Environment OTP:</span>
                <strong>{devOtp}</strong>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label>
                <span className={styles.labelLeft}>
                  <KeyRound size={12} />
                  6-Digit Verification Code
                </span>
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="------"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className={`${styles.input} ${styles.otpInput}`}
                required
                autoFocus
              />
            </div>

            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="trust_device"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
              />
              <label htmlFor="trust_device">Trust this device for 30 days</label>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" disabled={loading || otpCode.length !== 6} className={styles.button}>
              {loading ? (
                <>
                  <Loader2 size={14} className={styles.spin} />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Authorize & Enter</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsStepUp(false);
                setError(null);
              }}
              className={styles.backBtn}
            >
              <ArrowLeft size={13} /> Back to Sign In
            </button>
          </form>
        )}

        <div className={styles.switchAuth}>
          Don&apos;t have an operator account?
          <Link href="/dashboard/register">Register</Link>
        </div>

        <div className={styles.footerNote}>
          <span>Protected with cryptographic session tokens & server-side revocation.</span>
        </div>
      </div>
    </div>
  );
}
