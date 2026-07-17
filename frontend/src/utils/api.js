const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getToken = () => localStorage.getItem('architect_token');

export const api = async (path, options = {}) => {
  const token = getToken();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    // Auto-logout only on auth errors (not server errors — those should surface to the user)
    if (res.status === 401) {
      window.dispatchEvent(new Event('system-error-logout'));
    }

    return res;
  } catch (error) {
    // Also auto-logout on network/system failures
    window.dispatchEvent(new Event('system-error-logout'));
    throw error;
  }
};
