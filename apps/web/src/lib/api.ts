const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface TransactionRecord {
  id: string;
  razorpay_payment_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  international: boolean;
  customer_id: string;
  merchant_id: string;
  device_id?: string | null;
  ip_hash?: string | null;
  geo_region?: string | null;
  created_at: string;
  updated_at: string;
  risk_score?: number | null;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
}

export interface RiskSignal {
  feature: string;
  value: string | number | boolean | null;
  description: string;
}

export interface RiskFactors {
  top_signals: RiskSignal[];
}

export interface RiskAssessmentRecord {
  id: string;
  transaction_id: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  model_name?: string | null;
  model_version?: string | null;
  decision: 'ALLOW' | 'REVIEW' | 'BLOCK';
  confidence?: number | null;
  risk_factors?: RiskFactors | null;
  created_at: string;
}

export interface InvestigationReasoning {
  what_happened: string;
  why_flagged: string;
  what_changed_from_normal?: string;
  multiple_independent_signals?: string;
  evidence_weakening_concern?: string;
  what_should_happen_next?: string;
}

export interface EvidenceProvenance {
  source_type: string;
  source_ref: string;
}

export interface EvidenceAnomaly {
  signal: string;
  observed_value: string | number | boolean;
  baseline_value?: string | number | boolean | null;
  window?: string | null;
  description: string;
  provenance?: EvidenceProvenance | null;
}

export interface InvestigationRecord {
  investigation_id: string;
  transaction_id: string;
  risk_assessment_id?: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'INSUFFICIENT_EVIDENCE';
  risk_score?: number | null;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  summary?: string | null;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  reasoning?: InvestigationReasoning | null;
  evidence?: {
    anomalies?: EvidenceAnomaly[];
    transaction_evidence?: Record<string, unknown>;
    risk_assessment?: Record<string, unknown>;
    customer_behavior?: Record<string, unknown>;
    velocity_evidence?: Record<string, unknown>;
    historical_context?: string[];
  } | null;
  key_findings?: string[] | null;
  recommendation?: 'ALLOW' | 'MONITOR' | 'REVIEW' | 'ESCALATE' | null;
  confidence?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  agent_model?: string | null;
  agent_version?: string | null;
  completed_at?: string | null;
}

export interface AuditEventRecord {
  id: string;
  transaction_id: string;
  event_type: string;
  actor_type: string;
  action: string;
  details?: Record<string, unknown> | null;
  created_at: string;
}

export interface ModelPerformanceMetrics {
  experiment_id: string;
  timestamp: number;
  model_name: string;
  threshold: number;
  test_metrics: {
    threshold: number;
    precision: number;
    recall: number;
    f1: number;
    pr_auc: number;
    roc_auc: number;
    fpr: number;
    brier_score: number;
    fraud_amount_captured: number;
    total_fraud_amount: number;
    fraud_capture_rate: number;
    legitimate_amount_flagged: number;
    false_positive_cost: number;
    synthetic_utility: number;
  };
}

export interface SimulatePaymentPayload {
  razorpay_payment_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  customer_id: string;
  merchant_id: string;
  device_id?: string;
  ip_hash?: string;
  geo_region?: string;
  international?: boolean;
}

export interface UserRecord {
  id: string;
  email: string;
  name?: string | null;
  email_verified: boolean;
  role: string;
  created_at: string;
}

export interface AuthStatusResponse {
  status: 'authenticated' | 'requires_verification' | 'registration_pending' | 'password_reset_pending' | 'password_reset_completed' | 'failed';
  message: string;
  user?: UserRecord;
  recovery_codes?: string[];
  dev_otp?: string;
}

export interface SecuritySessionRecord {
  id: string;
  device_name: string;
  ip_address?: string | null;
  is_current: boolean;
  is_trusted: boolean;
  last_seen_at: string;
  created_at: string;
  expires_at: string;
}

export interface SecurityEventRecord {
  id: string;
  event_type: string;
  device_info?: string | null;
  ip_address?: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
}

const fetchWithAuth = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/dashboard/login';
      }
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status}`);
  }
  
  return response.json();
};

export const ZecureAPI = {
  // Legacy / Quick Login
  login: (passcodeOrEmail: string, password?: string): Promise<{ status: string }> => {
    if (password) {
      return fetchWithAuth<{ status: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: passcodeOrEmail, password })
      });
    }
    return fetchWithAuth<{ status: string }>('/dashboard/auth/login', {
      method: 'POST',
      body: JSON.stringify({ passcode: passcodeOrEmail })
    });
  },

  // Full Modular Auth Suite
  register: (payload: { email: string; password: string; name?: string }): Promise<AuthStatusResponse> =>
    fetchWithAuth<AuthStatusResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  verifyRegistration: (payload: { email: string; code: string }): Promise<AuthStatusResponse> =>
    fetchWithAuth<AuthStatusResponse>('/auth/verify-registration', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  resendCode: (payload: { email: string; purpose?: string }): Promise<AuthStatusResponse> =>
    fetchWithAuth<AuthStatusResponse>('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email: payload.email, purpose: payload.purpose || 'REGISTRATION' })
    }),

  loginWithCredentials: (payload: { email: string; password: string }): Promise<AuthStatusResponse> =>
    fetchWithAuth<AuthStatusResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  verifyLoginStepUp: (payload: { email: string; code: string; trust_device: boolean }): Promise<AuthStatusResponse> =>
    fetchWithAuth<AuthStatusResponse>('/auth/verify-login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  forgotPassword: (email: string): Promise<AuthStatusResponse> =>
    fetchWithAuth<AuthStatusResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (payload: { email: string; code: string; new_password: string }): Promise<AuthStatusResponse> =>
    fetchWithAuth<AuthStatusResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: (): Promise<UserRecord> =>
    fetchWithAuth<UserRecord>('/auth/me'),

  getSecuritySessions: (): Promise<SecuritySessionRecord[]> =>
    fetchWithAuth<SecuritySessionRecord[]>('/auth/security/sessions'),

  revokeSession: (sessionId: string): Promise<{ status: string; session_id: string }> =>
    fetchWithAuth<{ status: string; session_id: string }>(`/auth/security/sessions/${sessionId}`, {
      method: 'DELETE'
    }),

  getSecurityActivity: (): Promise<SecurityEventRecord[]> =>
    fetchWithAuth<SecurityEventRecord[]>('/auth/security/activity'),
  
  logout: () => fetchWithAuth<{ status: string }>('/auth/logout', {
    method: 'POST'
  }),
  
  getTransactions: (limit: number = 50): Promise<TransactionRecord[]> => 
    fetchWithAuth<TransactionRecord[]>(`/dashboard/transactions?limit=${limit}`),
  
  getTransaction: (id: string): Promise<TransactionRecord> => 
    fetchWithAuth<TransactionRecord>(`/dashboard/transactions/${id}`),
  
  getRiskAssessment: (id: string): Promise<RiskAssessmentRecord> => 
    fetchWithAuth<RiskAssessmentRecord>(`/dashboard/risk/${id}`),
  
  getInvestigations: (limit: number = 50): Promise<InvestigationRecord[]> => 
    fetchWithAuth<InvestigationRecord[]>(`/dashboard/investigations?limit=${limit}`),

  getInvestigation: (id: string): Promise<InvestigationRecord> => 
    fetchWithAuth<InvestigationRecord>(`/dashboard/investigations/${id}`),
  
  getAllAuditEvents: (limit: number = 100): Promise<AuditEventRecord[]> =>
    fetchWithAuth<AuditEventRecord[]>(`/dashboard/audit?limit=${limit}`),

  getAuditTrail: (id: string): Promise<AuditEventRecord[]> => 
    fetchWithAuth<AuditEventRecord[]>(`/dashboard/audit/${id}`),
  
  getPerformance: (): Promise<ModelPerformanceMetrics> => 
    fetchWithAuth<ModelPerformanceMetrics>('/dashboard/performance'),
  
  simulatePayment: (transactionPayload: SimulatePaymentPayload): Promise<RiskAssessmentRecord> => 
    fetchWithAuth<RiskAssessmentRecord>('/dashboard/simulate', {
      method: 'POST',
      body: JSON.stringify({ transaction: transactionPayload })
    })
};

