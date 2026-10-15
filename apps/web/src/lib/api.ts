const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export async function api<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const csrfToken = getCsrfToken();
  if (csrfToken && options.method && !SAFE_METHODS.has(options.method.toUpperCase())) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    const error = data as { error?: { message?: string; code?: string } };
    throw new Error(error.error?.message ?? `Request failed with status ${response.status}`);
  }

  return data as T;
}

export { API_BASE };
