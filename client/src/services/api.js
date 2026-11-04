// API client — connects to the MADAD backend
// In production VITE_API_URL points to the deployed backend; in dev the Vite proxy forwards /api

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '/api/v1';

// Helper: build headers including the auth token when available
function authHeaders(extraHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  try {
    const token = localStorage.getItem('madad_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) { /* localStorage unavailable */ }
  return headers;
}

// ── Health ──────────────────────────────────────────────
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Providers ──────────────────────────────────────────
export async function fetchProviders(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/providers?${query}`);
  return await res.json();
}

export async function fetchProviderById(id) {
  const res = await fetch(`${API_BASE}/providers/${id}`);
  return await res.json();
}

// ── Auth ───────────────────────────────────────────────
export async function authLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return await res.json();
}

export async function authRegister(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function authForgotPassword(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return await res.json();
}

export async function authResetPassword(email, resetToken, newPassword) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, resetToken, newPassword })
  });
  return await res.json();
}

// ── Help Requests (protected — token sent automatically) ──
export async function submitHelpRequest(data) {
  const res = await fetch(`${API_BASE}/requests`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function fetchTrackRequest(code) {
  const res = await fetch(`${API_BASE}/requests/track/${encodeURIComponent(code)}`);
  return await res.json();
}

export async function fetchUserRequests(userId) {
  const res = await fetch(`${API_BASE}/users/${userId}/requests`, {
    headers: authHeaders()
  });
  return await res.json();
}

export async function logContactAttempt(requestId, data) {
  const res = await fetch(`${API_BASE}/requests/${requestId}/contact-attempts`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function confirmHelpResolution(requestId, feedback) {
  const res = await fetch(`${API_BASE}/requests/${requestId}/confirm-resolution`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(feedback)
  });
  return await res.json();
}

export async function reportStillNeedHelp(requestId, notes) {
  const res = await fetch(`${API_BASE}/requests/${requestId}/still-need-help`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ notes })
  });
  return await res.json();
}

// ── Give Help ──────────────────────────────────────────
export async function fetchGiveHelpFeed(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/give-help/feed?${query}`);
  return await res.json();
}

export async function submitAssistanceOffer(requestId, offerData) {
  const res = await fetch(`${API_BASE}/give-help/requests/${requestId}/offer`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(offerData)
  });
  return await res.json();
}

// ── Admin ──────────────────────────────────────────────
export async function fetchAdminMetrics() {
  const res = await fetch(`${API_BASE}/admin/metrics`, { headers: authHeaders() });
  return await res.json();
}

export async function updateProviderVerification(providerId, status, notes) {
  const res = await fetch(`${API_BASE}/admin/providers/${providerId}/verification`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status, notes, admin_name: 'Lead Admin' })
  });
  return await res.json();
}

// ── Voice Notes ────────────────────────────────────────
export async function uploadVoiceNote(requestId, audioBlob) {
  const formData = new FormData();
  formData.append('voice', audioBlob, 'voice-note.webm');
  const headers = {};
  try {
    const token = localStorage.getItem('madad_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch (e) {}
  const res = await fetch(`${API_BASE}/requests/${requestId}/voice-note`, {
    method: 'POST',
    headers,
    body: formData
  });
  return await res.json();
}

// ── Reports ────────────────────────────────────────────
export async function submitReport(reportData) {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(reportData)
  });
  return await res.json();
}

export async function fetchAdminReports() {
  const res = await fetch(`${API_BASE}/admin/reports`, { headers: authHeaders() });
  return await res.json();
}
