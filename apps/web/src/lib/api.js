const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
export async function api(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
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
        const error = data;
        throw new Error(error.error?.message ?? `Request failed with status ${response.status}`);
    }
    return data;
}
export { API_BASE };
