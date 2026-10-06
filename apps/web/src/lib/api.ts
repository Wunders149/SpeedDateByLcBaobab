const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function api<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
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
