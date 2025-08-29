'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './login.module.scss';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className={styles.loginContainer}>
      {/* Background Effects */}
      <div className={styles.backgroundEffects}>
        <div className={styles.gradientOrb} />
        <div className={styles.gridPattern} />
      </div>

      <div className={styles.loginContent}>
        {/* Left Side - Branding */}
        <motion.div 
          className={styles.brandingSide}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className={styles.brandingContent}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <span className={styles.logoText}>
                <span className={styles.accent}>Zecure</span> ONE
              </span>
            </div>
            
            <h1 className={styles.brandingTitle}>
              Welcome Back to the Future of <span className={styles.highlight}>Cybersecurity</span>
            </h1>
            
            <p className={styles.brandingSubtitle}>
              Access your AI-powered security dashboard and stay ahead of emerging threats with real-time protection.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c.552 0 1-.448 1-1V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6c0 .552.448 1 1 1"/>
                  </svg>
                </div>
                <span>AI-Powered Threat Detection</span>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <span>Real-Time Monitoring</span>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                  </svg>
                </div>
                <span>Cloud-Native Security</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div 
          className={styles.formSide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Sign In</h2>
              <p className={styles.formSubtitle}>
                Enter your credentials to access your security dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.loginForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.inputLabel}>
                  Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Enter your email"
                    required
                  />
                  <div className={styles.inputIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.inputLabel}>
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.formOptions}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <div className={styles.checkmark}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span>Remember me</span>
                </label>

                <Link href="/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>

              <motion.button
                type="submit"
                className={styles.loginButton}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className={styles.loadingSpinner} />
                ) : (
                  <>
                    Sign In
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </>
                )}
              </motion.button>
            </form>

            <div className={styles.formFooter}>
              <p>
                Don't have an account?{' '}
                <Link href="/register" className={styles.registerLink}>
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
