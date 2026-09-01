'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { ZecureAPI } from '@/lib/api';
import styles from './forgot-password.module.scss';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Stage 1: Request Reset Code, Stage 2: Enter Code & New Password, Stage 3: Success
  const [stage, setStage] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const resp = await ZecureAPI.forgotPassword(email.trim());
      setStage(2);
      if (resp.dev_otp) {
        setDevOtp(resp.dev_otp);
        setOtpCode(resp.dev_otp);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await ZecureAPI.resetPassword({
        email: email.trim(),
        code: otpCode.trim(),
        new_password: newPassword,
      });
      setStage(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code or password reset error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.forgotContainer}>
      <div className={styles.forgotBox}>
        {/* Brand Header */}
        <div className={styles.header}>
          <div className={styles.brandIconWrap}>
            <ShieldCheck size={24} className={styles.shieldIcon} />
          </div>
          <h1 className={styles.brandTitle}>ZECURE</h1>
          <span className={styles.tagline}>OPERATOR CREDENTIAL RECOVERY</span>
          <p className={styles.subtitle}>
            {stage === 1 && 'Enter your registered work email to receive password reset instructions.'}
            {stage === 2 && `Enter the 6-digit reset code sent to ${email} and your new password.`}
            {stage === 3 && 'Password successfully updated. All active sessions have been revoked.'}
          </p>
        </div>

        {/* STAGE 1: Email Request */}
        {stage === 1 && (
          <form onSubmit={handleRequestSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>
                <Mail size={12} />
                <span>Work Email</span>
              </label>
              <input
                type="email"
                placeholder="operator@zecure.one"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? (
                <>
                  <Loader2 size={14} className={styles.spin} />
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <span>Request Reset Code</span>
              )}
            </button>
          </form>
        )}

        {/* STAGE 2: Code + New Password */}
        {stage === 2 && (
          <form onSubmit={handleResetSubmit} className={styles.form}>
            {devOtp && (
              <div className={styles.devOtpBanner}>
                <span>Dev Environment OTP:</span>
                <strong>{devOtp}</strong>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label>
                <KeyRound size={12} />
                <span>6-Digit Reset Code</span>
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

            <div className={styles.inputGroup}>
              <label>
                <Lock size={12} />
                <span>New Password</span>
              </label>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="new-password"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>
                <Lock size={12} />
                <span>Confirm New Password</span>
              </label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="new-password"
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" disabled={loading || otpCode.length !== 6} className={styles.button}>
              {loading ? (
                <>
                  <Loader2 size={14} className={styles.spin} />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password & Revoke Sessions</span>
              )}
            </button>
          </form>
        )}

        {/* STAGE 3: Completed */}
        {stage === 3 && (
          <div className={styles.form}>
            <div className={styles.successMsg}>
              Your operator credentials have been securely updated. All previous active sessions have been terminated.
            </div>

            <button
              type="button"
              onClick={() => router.push('/dashboard/login')}
              className={styles.button}
            >
              <span>Return to Sign In</span>
            </button>
          </div>
        )}

        <div className={styles.backLink}>
          <Link href="/dashboard/login">
            <ArrowLeft size={12} style={{ display: 'inline', marginRight: 4 }} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
