/* eslint-disable @typescript-eslint/no-explicit-any */

const API_BASE = 'http://localhost:8000/api/v1';

// We rely on the browser to send HttpOnly cookies for authentication automatically.
// The fetch options just need `credentials: 'include'`.

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Ensures our HttpOnly cookie is sent
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login if unauthorized
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
  login: (passcode: string) => fetchWithAuth('/dashboard/auth/login', {
    method: 'POST',
    body: JSON.stringify({ passcode })
  }),
  
  logout: () => fetchWithAuth('/dashboard/auth/logout', {
    method: 'POST'
  }),
  
  getTransactions: (limit: number = 50) => fetchWithAuth(`/dashboard/transactions?limit=${limit}`),
  
  getTransaction: (id: string) => fetchWithAuth(`/dashboard/transactions/${id}`),
  
  getRiskAssessment: (id: string) => fetchWithAuth(`/dashboard/risk/${id}`),
  
  getInvestigation: (id: string) => fetchWithAuth(`/dashboard/investigations/${id}`),
  
  getAuditTrail: (id: string) => fetchWithAuth(`/dashboard/audit/${id}`),
  
  getPerformance: () => fetchWithAuth('/dashboard/performance'),
  
  simulatePayment: (transactionPayload: any) => fetchWithAuth('/dashboard/simulate', {
    method: 'POST',
    body: JSON.stringify({ transaction: transactionPayload })
  })
};
