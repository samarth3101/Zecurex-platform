'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './register.module.scss';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    agreeTerms: false,
    subscribeUpdates: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#22c55e'];

  return (
    <div className={styles.registerContainer}>
      {/* Background Effects */}
      <div className={styles.backgroundEffects}>
        <div className={styles.gradientOrb} />
        <div className={styles.gridPattern} />
      </div>

      <div className={styles.registerContent}>
        {/* Left Side - Form */}
        <motion.div 
          className={styles.formSide}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
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

              <h2 className={styles.formTitle}>Create Your Account</h2>
              <p className={styles.formSubtitle}>
                Join thousands of organizations securing their digital future with AI-powered cybersecurity
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.registerForm}>
              <div className={styles.nameRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="firstName" className={styles.inputLabel}>
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="John"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="lastName" className={styles.inputLabel}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.inputLabel}>
                  Work Email
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="john@company.com"
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
                <label htmlFor="company" className={styles.inputLabel}>
                  Company Name
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Your Company"
                    required
                  />
                  <div className={styles.inputIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18"/>
                      <path d="M5 21V7l8-4v18"/>
                      <path d="M19 21V11l-6-4"/>
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
                    placeholder="Create a strong password"
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
                
                {formData.password && (
                  <div className={styles.passwordStrength}>
                    <div className={styles.strengthBar}>
                      <div 
                        className={styles.strengthFill}
                        style={{
                          width: `${(strength / 5) * 100}%`,
                          backgroundColor: strengthColors[strength - 1] || '#ef4444'
                        }}
                      />
                    </div>
                    <span 
                      className={styles.strengthLabel}
                      style={{ color: strengthColors[strength - 1] || '#ef4444' }}
                    >
                      {strengthLabels[strength - 1] || 'Very Weak'}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.inputLabel}>
                  Confirm Password
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword 
                        ? styles.inputError 
                        : ''
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <span className={styles.errorText}>Passwords do not match</span>
                )}
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    required
                  />
                  <div className={styles.checkmark}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span>
                    I agree to the{' '}
                    <Link href="/terms" className={styles.link}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
                  </span>
                </label>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="subscribeUpdates"
                    checked={formData.subscribeUpdates}
                    onChange={handleInputChange}
                  />
                  <div className={styles.checkmark}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span>Send me product updates and security insights</span>
                </label>
              </div>

              <motion.button
                type="submit"
                className={styles.registerButton}
                disabled={isLoading || !formData.agreeTerms || formData.password !== formData.confirmPassword}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className={styles.loadingSpinner} />
                ) : (
                  <>
                    Create Account
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </>
                )}
              </motion.button>
            </form>

            <div className={styles.formFooter}>
              <p>
                Already have an account?{' '}
                <Link href="/login" className={styles.loginLink}>
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Benefits */}
        <motion.div 
          className={styles.benefitsSide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <div className={styles.benefitsContent}>
            <h3 className={styles.benefitsTitle}>
              Why Choose <span className={styles.highlight}>Zecure ONE?</span>
            </h3>

            <div className={styles.benefitsList}>
              <motion.div 
                className={styles.benefit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className={styles.benefitIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
                  </svg>
                </div>
                <div>
                  <h4>AI-Powered Protection</h4>
                  <p>Advanced machine learning algorithms detect and prevent threats in real-time</p>
                </div>
              </motion.div>

              <motion.div 
                className={styles.benefit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className={styles.benefitIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                  </svg>
                </div>
                <div>
                  <h4>Cloud-Native Architecture</h4>
                  <p>Seamlessly scales with your infrastructure and adapts to your needs</p>
                </div>
              </motion.div>

              <motion.div 
                className={styles.benefit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className={styles.benefitIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div>
                  <h4>Real-Time Monitoring</h4>
                  <p>24/7 threat detection with instant alerts and automated responses</p>
                </div>
              </motion.div>

              <motion.div 
                className={styles.benefit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className={styles.benefitIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c.552 0 1-.448 1-1V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6c0 .552.448 1 1 1"/>
                  </svg>
                </div>
                <div>
                  <h4>Compliance Ready</h4>
                  <p>Meet industry standards with built-in compliance frameworks</p>
                </div>
              </motion.div>
            </div>

            <div className={styles.trustBadges}>
              <div className={styles.trustBadge}>
                <span className={styles.trustNumber}>10K+</span>
                <span className={styles.trustLabel}>Organizations Protected</span>
              </div>
              <div className={styles.trustBadge}>
                <span className={styles.trustNumber}>99.9%</span>
                <span className={styles.trustLabel}>Uptime Guarantee</span>
              </div>
              <div className={styles.trustBadge}>
                <span className={styles.trustNumber}>24/7</span>
                <span className={styles.trustLabel}>Expert Support</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
