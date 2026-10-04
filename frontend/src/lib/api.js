// Lightweight fetch wrapper for the COB API.
const BASE = import.meta.env.VITE_API_BASE || '';
const TOKEN_KEY = 'cob_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = false, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (data && data.error) || res.statusText || 'Request failed';
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (p, auth = false) => request(p, { auth }),
  post: (p, body, auth = false) => request(p, { method: 'POST', body, auth }),
  put: (p, body, auth = false) => request(p, { method: 'PUT', body, auth }),
  del: (p, auth = false) => request(p, { method: 'DELETE', auth }),
  upload: async (file, meta = {}) => {
    const form = new FormData();
    form.append('image', file);
    Object.entries(meta).forEach(([k, v]) => form.append(k, v));
    return request('/upload', { method: 'POST', body: form, auth: true, isForm: true });
  },
};

// Resolve stored image paths (/uploads/..) against the API base if set.
export function resolveImage(url) {
  if (!url) return '';
  if (/^https?:\/\//.test(url)) return url;
  return `${BASE}${url}`;
}
