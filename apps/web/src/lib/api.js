const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
function getCsrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
export async function api(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        ...options.headers,
    };
    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    const csrfToken = getCsrfToken();
    if (csrfToken && options.method && !SAFE_METHODS.has(options.method.toUpperCase())) {
        headers['X-CSRF-Token'] = csrfToken;
    }
    const config = {
        ...options,
        credentials: 'include',
        headers,
    };
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
        const error = data;
        throw new Error(error.error?.message ?? `Request failed with status ${response.status}`);
    }
    return data;
}
export { API_BASE };
