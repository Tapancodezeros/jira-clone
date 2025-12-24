const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  try { return localStorage.getItem('token'); } catch (e) { return null; }
}

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = options.headers || {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function requestWithRetry(path, options = {}, retries = 3, backoffMs = 300) {
  let attempt = 0;
  while (true) {
    try {
      return await request(path, options);
    } catch (err) {
      const isServerError = !err.status || (err.status >= 500 && err.status < 600);
      if (attempt >= retries || !isServerError) throw err;
      await new Promise((r) => setTimeout(r, backoffMs * Math.pow(2, attempt)));
      attempt += 1;
    }
  }
}

export const api = {
  get: (p, opts) => request(p, { method: 'GET', ...opts }),
  post: (p, body, opts) => request(p, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body), ...opts }),
  put: (p, body, opts) => request(p, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body), ...opts }),
  del: (p, opts) => request(p, { method: 'DELETE', ...opts }),
};

// Notification helpers (server must expose these endpoints)
export async function fetchNotifications() {
  return requestWithRetry('/notifications', {}, 2, 200);
}

export async function markNotificationRead(id) {
  if (!id) throw new Error('id required');
  return requestWithRetry(`/notifications/${id}/read`, { method: 'POST' }, 1, 200);
}

export default api;
