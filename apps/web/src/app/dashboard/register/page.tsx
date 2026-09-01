'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, KeyRound, Loader2, User, CheckCircle2 } from 'lucide-react';
import { ZecureAPI } from '@/lib/api';
import styles from './register.module.scss';

export default function RegisterPage() {
  const router = useRouter();

  // Multi-step Registration: 1 = Register, 2 = Verify Email OTP, 3 = Recovery Codes
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Security Setup / Recovery Codes
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [storedConfirmed, setStoredConfirmed] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    return score;
  };
  const strengthScore = getPasswordStrength(password);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (strengthScore < 4) {
      setError('Password must contain at least 8 characters, with uppercase, lowercase, and numbers.');
      return;
    }

    setLoading(true);
    try {
      const resp = await ZecureAPI.register({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
      });

      if (resp.status === 'registration_pending') {
        setStep(2);
        if (resp.dev_otp) {
          setDevOtp(resp.dev_otp);
          setOtpCode(resp.dev_otp);
        }
      } else {
        setError(resp.message || 'Registration failed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const resp = await ZecureAPI.verifyRegistration({
        email: email.trim(),
        code: otpCode.trim(),
      });

      if (resp.recovery_codes && resp.recovery_codes.length > 0) {
        setRecoveryCodes(resp.recovery_codes);
        setStep(3);
      } else {
        router.push('/dashboard/login');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = () => {
    router.push('/dashboard/login');
  };

  const maskEmail = (str: string) => {
    const parts = str.split('@');
    if (parts.length < 2) return str;
    const namePart = parts[0];
    const masked = namePart[0] + '••••••';
    return `${masked}@${parts[1]}`;
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        {/* Brand Header */}
        <div className={styles.header}>
          <div className={styles.brandIconWrap}>
            {step === 3 ? (
              <CheckCircle2 size={24} className={styles.shieldIcon} />
            ) : step === 2 ? (
              <KeyRound size={24} className={styles.shieldIcon} />
            ) : (
              <ShieldCheck size={24} className={styles.shieldIcon} />
            )}
          </div>
          <h1 className={styles.brandTitle}>ZECURE</h1>
          <span className={styles.tagline}>
            {step === 1 && 'CREATE OPERATOR ACCOUNT'}
            {step === 2 && 'VERIFY YOUR WORK EMAIL'}
            {step === 3 && 'ACCOUNT SECURITY SETUP'}
          </span>
          <p className={styles.subtitle}>
            {step === 1 && 'Provision access to the real-time payment risk intelligence platform.'}
            {step === 2 && `We've sent a 6-digit verification code to ${maskEmail(email)}`}
            {step === 3 && 'Your one-time recovery codes have been generated.'}
          </p>
        </div>

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>
                <User size={12} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                autoComplete="name"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>
                <Mail size={12} />
                <span>Work Email</span>
              </label>
              <input
                type="email"
                placeholder="operator@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>
                <Lock size={12} />
                <span>Password</span>
              </label>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="new-password"
              />
              <div className={styles.strengthBar}>
                <div className={`${styles.strengthSegment} ${strengthScore >= 1 ? (strengthScore <= 2 ? styles.activeWeak : strengthScore === 3 ? styles.activeMedium : styles.activeStrong) : ''}`} />
                <div className={`${styles.strengthSegment} ${strengthScore >= 2 ? (strengthScore === 2 ? styles.activeWeak : strengthScore === 3 ? styles.activeMedium : styles.activeStrong) : ''}`} />
                <div className={`${styles.strengthSegment} ${strengthScore >= 3 ? (strengthScore === 3 ? styles.activeMedium : styles.activeStrong) : ''}`} />
                <div className={`${styles.strengthSegment} ${strengthScore >= 4 ? styles.activeStrong : ''}`} />
              </div>
              <span className={styles.strengthText}>
                {strengthScore === 0 && 'Enter password'}
                {strengthScore >= 1 && strengthScore <= 2 && 'Weak: Must include uppercase, lowercase, numbers'}
                {strengthScore === 3 && 'Medium: Add remaining required character types'}
                {strengthScore === 4 && 'Strong password requirement satisfied'}
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label>
                <Lock size={12} />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="new-password"
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? (
                <>
                  <Loader2 size={14} className={styles.spin} />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Continue to Verification</span>
              )}
            </button>

            <div className={styles.switchAuth}>
              Already an authorized operator?
              <Link href="/dashboard/login">Sign In</Link>
            </div>
          </form>
        )}

        {/* STEP 2: Email OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtpSubmit} className={styles.form}>
            {devOtp && (
              <div className={styles.devOtpBanner}>
                <span>Dev Environment OTP:</span>
                <strong>{devOtp}</strong>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label>
                <KeyRound size={12} />
                <span>6-Digit Verification Code</span>
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

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" disabled={loading || otpCode.length !== 6} className={styles.button}>
              {loading ? (
                <>
                  <Loader2 size={14} className={styles.spin} />
                  <span>Activating Account...</span>
                </>
              ) : (
                <span>Verify Email & Generate Keys</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Recovery Codes Setup */}
        {step === 3 && (
          <div className={styles.form}>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              These codes can be used to recover your account if you lose access to your email. Each code can be used once. Store them in a safe place.
            </p>

            <div className={styles.recoveryGrid}>
              {recoveryCodes.map((code, idx) => (
                <div key={idx} className={styles.recoveryCode}>
                  {code}
                </div>
              ))}
            </div>

            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="stored_confirmed"
                checked={storedConfirmed}
                onChange={(e) => setStoredConfirmed(e.target.checked)}
              />
              <label htmlFor="stored_confirmed">
                I have securely stored my recovery codes.
              </label>
            </div>

            <button
              type="button"
              disabled={!storedConfirmed}
              onClick={handleCompleteRegistration}
              className={styles.button}
            >
              <span>Account Activated — Enter Zecure</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
