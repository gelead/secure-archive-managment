// api.js

// Use Vite environment variables
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const fetchJson = async (url, opts = {}) => {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data && data.error ? data.error : `HTTP ${res.status}`);
  return data;
};

const getAuthHeaders = (accessToken) => ({
  'Content-Type': 'application/json',
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
});

export const api = {
  auth: {
    login: async (username, password) =>
      fetchJson(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      }),
    verifyOtp: async (username, token, biometricData) =>
      fetchJson(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, token, biometricData }),
      }),
    refresh: async (refreshToken) =>
      fetchJson(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }),
    register: async (payload) =>
      fetchJson(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    logout: async (accessToken) =>
      fetchJson(`${API_BASE}/auth/logout`, { method: 'POST', headers: getAuthHeaders(accessToken) }),
    changePassword: async (accessToken, oldPassword, newPassword) =>
      fetchJson(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({ oldPassword, newPassword }),
      }),
    verifyEmail: async (accessToken, code) =>
      fetchJson(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({ code }),
      }),
    verifyPhone: async (accessToken, code) =>
      fetchJson(`${API_BASE}/auth/verify-phone`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({ code }),
      }),
    enableMFA: async (accessToken, mfaType, verificationCode) =>
      fetchJson(`${API_BASE}/auth/enable-mfa`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({ mfaType, verificationCode }),
      }),
  },

  files: {
    getAll: async (accessToken) =>
      fetchJson(`${API_BASE}/files`, { headers: getAuthHeaders(accessToken) }),
    checkAccess: async (accessToken, fileId) =>
      fetchJson(`${API_BASE}/files/${fileId}/access`, { headers: getAuthHeaders(accessToken) }),
    share: async (accessToken, fileId, targetUserId, permissions) =>
      fetchJson(`${API_BASE}/files/${fileId}/share`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({ targetUserId, permissions }),
      }),
    unshare: async (accessToken, fileId, targetUserId) =>
      fetchJson(`${API_BASE}/files/${fileId}/unshare`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({ targetUserId }),
      }),
  },

  profile: {
    get: async (accessToken) =>
      fetchJson(`${API_BASE}/users/profile`, { headers: getAuthHeaders(accessToken) }),
    update: async (accessToken, profileData) =>
      fetchJson(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify(profileData),
      }),
  },

  admin: {
    getModel: async () => fetchJson(`${API_BASE}/admin/model`),
    setModel: async (accessToken, model) =>
      fetchJson(`${API_BASE}/admin/model`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({ model }),
      }),
    backup: async (accessToken) =>
      fetchJson(`${API_BASE}/admin/backup`, { method: 'POST', headers: getAuthHeaders(accessToken) }),
    getBackups: async (accessToken) =>
      fetchJson(`${API_BASE}/admin/backups`, { headers: getAuthHeaders(accessToken) }),
    assignRole: async (accessToken, userId, role) =>
      fetchJson(`${API_BASE}/users/assign-role`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({ userId, role }),
      }),
    getUsers: async (accessToken) =>
      fetchJson(`${API_BASE}/users`, { headers: getAuthHeaders(accessToken) }),
  },

  logs: {
    getAll: async (accessToken, limit) =>
      fetchJson(`${API_BASE}/logs${limit ? `?limit=${limit}` : ''}`, { headers: getAuthHeaders(accessToken) }),
  },

  alerts: {
    getAll: async (accessToken, limit) =>
      fetchJson(`${API_BASE}/alerts${limit ? `?limit=${limit}` : ''}`, { headers: getAuthHeaders(accessToken) }),
    acknowledge: async (accessToken, alertId) =>
      fetchJson(`${API_BASE}/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
      }),
  },

  permissions: {
    getLogs: async (accessToken, fileId, userId) => {
      const params = new URLSearchParams();
      if (fileId) params.append('fileId', fileId);
      if (userId) params.append('userId', userId);
      return fetchJson(`${API_BASE}/permissions/logs?${params}`, {
        headers: getAuthHeaders(accessToken),
      });
    },
  },

  sessions: {
    getAll: async (accessToken) =>
      fetchJson(`${API_BASE}/admin/sessions`, { headers: getAuthHeaders(accessToken) }),
    revoke: async (accessToken, sessionId) =>
      fetchJson(`${API_BASE}/admin/sessions/${sessionId}`, { method: 'DELETE', headers: getAuthHeaders(accessToken) }),
  },

  roles: {
    requestRole: async (accessToken, requestedRole) =>
      fetchJson(`${API_BASE}/role-requests/requests`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({ requestedRole }),
      }),
    getRequests: async (accessToken) =>
      fetchJson(`${API_BASE}/role-requests/requests`, { headers: getAuthHeaders(accessToken) }),
    approveRequest: async (accessToken, requestId) =>
      fetchJson(`${API_BASE}/role-requests/requests/${requestId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
      }),
    rejectRequest: async (accessToken, requestId, reason) =>
      fetchJson(`${API_BASE}/role-requests/requests/${requestId}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({ reason }),
      }),
  },

  security: {
    getClearanceLevels: async (accessToken) =>
      fetchJson(`${API_BASE}/security/clearance-levels`, { headers: getAuthHeaders(accessToken) }),
    updateClearanceLevel: async (accessToken, userId, clearanceLevel) =>
      fetchJson(`${API_BASE}/security/clearance-levels/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({ clearanceLevel }),
      }),
    getLabels: async (accessToken) =>
      fetchJson(`${API_BASE}/security/labels`, { headers: getAuthHeaders(accessToken) }),
    updateLabel: async (accessToken, fileId, classification) =>
      fetchJson(`${API_BASE}/security/labels/${fileId}`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({ classification }),
      }),
  },
};
